// src/view/FlashcardApp.tsx
// 台語單字卡（例句 + 音檔 + URL index + 收藏）

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import "../style/FlashcardApp.css";

import backIcon from "../assets/back.svg";
import volumeIcon from "../assets/volume up.svg";
import leftArrow from "../assets/left.svg";
import rightArrow from "../assets/right.svg";
import starIcon from "../assets/star.svg";

import { api } from "../enum/api";
import { asyncGet } from "../utils/fetch";

/* ------------------ 型別 ------------------ */
type VocabCard = {
  _id: string;
  han?: string;
  tl?: string;
  ch?: string;
  audio_file_id?: any;
  chinese?: string;
  word?: string;
  name?: string;
  audioId?: any;
};

type Sentence = {
  _id: string;
  cardId?: string;
  han?: string;
  tl?: string;
  chinese?: string;
  ch?: string;
  audioId?: string;
  audioFileId?: any;
  audio_file_id?: any;
  audiourl?: string;
  audioUrl?: string;
  audioFilename?: string;
  sentenceIndex?: number;
};

/* ------------------ 小工具 ------------------ */
const useQuery = () => new URLSearchParams(useLocation().search);

function extractId(input: any): string {
  if (!input) return "";
  if (typeof input === "string") return input;
  if (typeof input === "object") {
    const cands = [input._id, input.$oid, input.oid, input.id, input.value];
    for (const c of cands) if (typeof c === "string" && c.trim()) return c;
  }
  if (Array.isArray(input)) {
    for (const it of input) {
      const v = extractId(it);
      if (v) return v;
    }
  }
  return "";
}

// 簡易 POST JSON
async function postJSON(url: string, data: any) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) return res.json();
  return res.text();
}

function getUserId(): string | null {
  return localStorage.getItem("userId");
}


/* ------------------ 元件 ------------------ */
const FlashcardApp: React.FC = () => {
  const navigate = useNavigate();
  const { categoryId: paramCategoryId } = useParams<{ categoryId: string }>();
  const location = useLocation();
  const query = useQuery();

  const queryCategoryId = query.get("categoryId") || undefined;
  const stateCategoryId = (location.state as any)?.categoryId as string | undefined;
  const effectiveCategoryId = paramCategoryId || queryCategoryId || stateCategoryId;

  const titleFromQuery = query.get("title") || "";
  const indexFromQuery = query.get("index") ? Number(query.get("index")) : null;
  const cardIdFromQuery = query.get("cardId") || undefined;

  const [cards, setCards] = useState<VocabCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState<string | null>(null);

  const [sentences, setSentences] = useState<Sentence[]>([]);
  const [flipped, setFlipped] = useState(false);

  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [currentIndex, setCurrentIndex] = useState(0);
  
  
  

  const total = cards.length;



  // 音訊
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const userId = getUserId();

  /* 讀取某分類的單字卡 */
  useEffect(() => {
    if (!effectiveCategoryId) return;

    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setErrMsg(null);

        // 先拿卡片
        const url = `${api.vocabCardsByCategory}/${encodeURIComponent(effectiveCategoryId)}`;
        const res = await asyncGet(url);
        const list: VocabCard[] = res?.body ?? res ?? [];
        if (!Array.isArray(list) || list.length === 0) throw new Error("此主題暫無單字卡");

        // 優先處理 cardId 參數，然後是 index 參數，最後從 0 開始
        let safeIndex = 0; // 預設從 0 開始

        // 如果有 cardId 參數，找到對應的索引
        if (cardIdFromQuery) {
          const cardIndex = list.findIndex(card => card._id === cardIdFromQuery);
          if (cardIndex !== -1) {
            safeIndex = cardIndex;
          }
        }
        // 如果沒有 cardId 但有 index 參數
        else if (indexFromQuery !== null && 
                 Number.isFinite(indexFromQuery) && 
                 indexFromQuery >= 0 && 
                 indexFromQuery < list.length) {
          safeIndex = indexFromQuery;
        }


        if (!cancelled) {
          setCards(list);
          setCurrentIndex(safeIndex);
          setFlipped(false);
        }
      } catch (e: any) {
        if (!cancelled) setErrMsg(e?.message || "讀取單字卡失敗");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
        audioRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveCategoryId]);

  /* 讀我的收藏清單 */
  useEffect(() => {
    if (!userId) {
      setFavoriteIds(new Set());
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await asyncGet(`${api.vocabCollectionList}/${encodeURIComponent(userId)}`);
        const raw = res?.body ?? res ?? [];
        const list: any[] = Array.isArray(raw?.vocabulary) ? raw.vocabulary : Array.isArray(raw) ? raw : [];
        const set = new Set<string>();
        for (const item of list) {
          const id =
            typeof item === "string"
              ? item
              : extractId(item?._id) || extractId((item as any)?.cardId) || extractId((item as any)?.vocabulary?._id);
          if (id) set.add(id);
        }
        if (!cancelled) setFavoriteIds(set);
      } catch {
        if (!cancelled) setFavoriteIds(new Set());
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  /* 目前卡片 */
  const currentCard = cards[currentIndex] || null;

  /* 切卡時載入例句 */
  useEffect(() => {
    if (!currentCard?._id) {
      setSentences([]);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const url = `${api.sentenceByCard}/${encodeURIComponent(currentCard._id)}`;
        const res = await asyncGet(url);
        const list: Sentence[] = res?.body ?? res ?? [];
        if (!cancelled) setSentences(Array.isArray(list) ? list : []);
      } catch (err) {
        console.error('Failed to load sentences:', err);
        if (!cancelled) setSentences([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [currentCard?._id]);

  /* 正反面內容 */
  const frontLines = useMemo(() => {
    if (!currentCard) return [];
    const hanji = currentCard.han || currentCard.name || currentCard.word || "";
    const tailo = currentCard.tl || currentCard.word || "";
    const chineseRaw = currentCard.ch || currentCard.chinese || "";
    const chinese = chineseRaw ? `（${chineseRaw}）` : "";
    return [hanji, tailo, chinese].filter((s) => !!String(s || "").trim());
  }, [currentCard]);

  const activeSentence: Sentence | null = useMemo(() => {
    if (!sentences.length || currentIndex === null) return null;
    const idx = ((currentIndex % sentences.length) + sentences.length) % sentences.length;
    return sentences[idx];
  }, [sentences, currentIndex]);

  const backLines = useMemo(() => {
    if (!activeSentence) return [];
    const han = activeSentence.han || "";
    const tl = activeSentence.tl || "";
    const cnRaw = activeSentence.ch || activeSentence.chinese || "";
    const cn = cnRaw ? `（${cnRaw}）` : "";
    return [han, tl, cn].filter((s) => !!String(s || "").trim());
  }, [activeSentence]);

  /* 收藏（toggle + 樂觀更新） */
  const isCurrentCardFavorited = currentCard?._id ? favoriteIds.has(currentCard._id) : false;
  

  const handleFavoriteToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentCard?._id) return;
    if (!userId) {
      alert("請先登入才能使用收藏功能。");
      return;
    }
    const cardId = currentCard._id;
    const next = new Set(favoriteIds);
    if (next.has(cardId)) next.delete(cardId);
    else next.add(cardId);
    setFavoriteIds(next);

    try {
      await postJSON(api.vocabCollectionToggle, { userId, cardId });
    } catch (err) {
      console.error("toggle favorite failed:", err);
      const rollback = new Set(next);
      if (rollback.has(cardId)) rollback.delete(cardId);
      else rollback.add(cardId);
      setFavoriteIds(rollback);
      alert("收藏狀態更新失敗，請稍後再試。");
    }
  };

  /* URL 同步 index + 音訊處理 */
  const stopAudio = () => {
    if (!audioRef.current) return;
    audioRef.current.pause();
    setIsPlaying(false);
  };



  // 當當前位置更新時更新 URL 和重置翻轉狀態
  useEffect(() => {
    if (!total) return;
    const params = new URLSearchParams(location.search);
    params.set("index", String(currentIndex));
    navigate(`${location.pathname}?${params.toString()}`, { replace: true });
    setFlipped(false);
    stopAudio();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, total]);


  /* 音訊控制（共用） */
  const playPauseWithUrl = async (url: string | null) => {
    if (!url) return;
    try {
      if (!audioRef.current) {
        audioRef.current = new Audio();
        audioRef.current.preload = "auto";
        audioRef.current.crossOrigin = "anonymous";
        audioRef.current.addEventListener("ended", () => {
          setIsPlaying(false);
        });
        audioRef.current.addEventListener("pause", () => setIsPlaying(false));
        audioRef.current.addEventListener("play", () => {
          setIsPlaying(true);
        });
      }
      const el = audioRef.current;
      if (!el.paused && el.src === url) {
        el.pause();
        return;
      }
      el.src = url;
      await el.play();
      
    } catch (err) {
      console.error("audio play failed:", err);
      alert("此例句的音檔暫時無法播放，請稍後再試。");
    }
  };

  const frontAudioUrl = useMemo(() => {
    const audioKeyRaw = currentCard?.audio_file_id ?? currentCard?.audioId;
    const id = extractId(audioKeyRaw);
    if (!id) return null;
    return `${api.vocabAudioStream}/${encodeURIComponent(id)}?cb=${Date.now()}`;
  }, [currentCard]);

  const backAudioUrl = useMemo(() => {
    // 優先使用後端直接提供的 audioUrl
    const direct = activeSentence?.audiourl || activeSentence?.audioUrl || "";
    if (direct) {
      return direct;
    }
    
    // 如果沒有直接 URL，嘗試從 audioId 構建
    const audioKeyRaw = activeSentence?.audioId ?? activeSentence?.audioFileId ?? activeSentence?.audio_file_id;
    const id = extractId(audioKeyRaw);
    if (!id) {
      return null;
    }
    const url = `${api.sentenceAudioStream}/${encodeURIComponent(id)}?cb=${Date.now()}`;
    return url;
  }, [activeSentence]);

  /* 翻頁 */
  const handleNextCard = () => {
    if (currentIndex === null || currentIndex >= cards.length - 1) return;
    
    
    const newIndex = currentIndex + 1;
    setCurrentIndex(newIndex);
    
  };
  
  const handlePrevCard = () => {
    if (currentIndex === null || currentIndex <= 0) return;
    setCurrentIndex((i) => (i || 0) - 1);
  };

  /* 無分類時 */
  if (!effectiveCategoryId) {
    return (
      <>
        <header id="header" className="site-header">
          <div className="header-content">
            <button className="back-button" aria-label="Go back" onClick={() => navigate(-1)}>
              <img src={backIcon} alt="Back Icon" />
            </button>

            <h1 className="header-title">{titleFromQuery || "台語單字卡"}</h1>

          </div>
        </header>
        <main className="flashcard-section">
          <div style={{ padding: 24, textAlign: "center", fontWeight: 700 }}>
            請從「主題選擇」進入單字卡（缺少 categoryId）。
          </div>
        </main>
      </>
    );
  }

  /* 介面 */
  return (
    <>
      <header id="header" className="site-header">
        <div className="header-content">
          <button className="back-button" aria-label="Go back" onClick={() => navigate(-1)}>
            <img src={backIcon} alt="Back Icon" />
          </button>
          <h1 className="header-title">{titleFromQuery || "台語單字卡"}</h1>

        </div>
      </header>

      <main id="flashcard-app" className="flashcard-section">
        {loading && <div style={{ padding: 24, textAlign: "center", fontWeight: 700 }}>讀取中…</div>}

        {!loading && errMsg && (
          <div style={{ padding: 24, textAlign: "center", color: "#b00", fontWeight: 700 }}>{errMsg}</div>
        )}

        {!loading && !errMsg && cards.length > 0 && (
          <div className="flashcard-area">
            {/* 卡片 */}
            <div className={`flashcard ${flipped ? "flipped" : ""}`} onClick={() => setFlipped(!flipped)}>
              <div className="flashcard-inner">
                {/* Front */}
                <div className="flashcard-front">
                  <div className="card-icons">
                    <button
                      className="icon-button"
                      aria-label={isPlaying ? "Pause audio" : "Play audio"}
                      onClick={(e) => {
                        e.stopPropagation();
                        playPauseWithUrl(frontAudioUrl);
                      }}
                      disabled={!frontAudioUrl}
                      title={!frontAudioUrl ? "此卡暫無音檔" : isPlaying ? "暫停" : "播放"}
                    >
                      <img src={volumeIcon} alt="Volume Icon" />
                    </button>

                    <button
                      className="icon-button"
                      aria-label={userId ? "Toggle favorite" : "Login required"}
                      onClick={handleFavoriteToggle}
                      disabled={!userId}
                      title={userId ? "加入/取消收藏" : "請先登入"}
                    >
                      <img
                        src={starIcon}
                        alt="Star Icon"
                        className={`star-icon ${isCurrentCardFavorited ? "favorited" : ""}`}
                        style={{ opacity: userId ? 1 : 0.4 }}
                      />
                    </button>
                  </div>

                  <div className="flashcard-content">
                    {frontLines.map((line, i) => (
                      <p key={`f-${i}`} className={`flashcard-text-line ${i === 2 ? "flashcard-text-chinese" : ""}`}>
                        {line}
                      </p>
                    ))}
                  </div>
                </div>

                {/* Back */}
                <div className="flashcard-back">
                  <div className="card-icons">
                    <button
                      className="icon-button"
                      aria-label={isPlaying ? "Pause audio" : "Play audio"}
                      onClick={(e) => {
                        e.stopPropagation();
                        playPauseWithUrl(backAudioUrl);
                      }}
                      disabled={!backAudioUrl}
                      title={!backAudioUrl ? "此句暫無音檔" : isPlaying ? "暫停" : "播放"}
                    >
                      <img src={volumeIcon} alt="Volume Icon" />
                    </button>

                    <button
                      className="icon-button"
                      aria-label={userId ? "Toggle favorite" : "Login required"}
                      onClick={handleFavoriteToggle}
                      disabled={!userId}
                      title={userId ? "加入/取消收藏" : "請先登入"}
                    >
                      <img
                        src={starIcon}
                        alt="Star Icon"
                        className={`star-icon ${isCurrentCardFavorited ? "favorited" : ""}`}
                        style={{ opacity: userId ? 1 : 0.4 }}
                      />
                    </button>
                  </div>

                  <div className="flashcard-content">
                    {backLines.length === 0 ? (
                      <p className="flashcard-text-line">此單字暫無例句</p>
                    ) : (
                      backLines.map((line, i) => (
                        <p
                          key={`b-${i}`}
                          className={`flashcard-text-line example-line ${i === 2 ? "flashcard-text-chinese" : ""}`}
                        >
                          {line}
                        </p>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* 導覽 */}
            <nav className="card-navigation">
              <button className="nav-arrow" aria-label="Previous card" onClick={handlePrevCard} disabled={currentIndex === null || currentIndex === 0}>
                <img src={leftArrow} alt="Previous" />
              </button>

              <span className="page-counter">
                {(currentIndex || 0) + 1}/{cards.length}
              </span>

              <button
                className="nav-arrow"
                aria-label="Next card"
                onClick={handleNextCard}
                disabled={currentIndex === null || currentIndex === cards.length - 1}
                title="下一張"
              >
                <img src={rightArrow} alt="Next" />
              </button>
            </nav>
          </div>
        )}
      </main>
    </>
  );
};

export default FlashcardApp;
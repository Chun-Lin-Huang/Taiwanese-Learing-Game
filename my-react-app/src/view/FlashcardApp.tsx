// src/view/FlashcardApp.tsx
// 台語單字卡（例句 + 音檔 + URL index + 收藏）

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import "../style/FlashcardApp.css";

import backIcon from "../assets/back.svg";
import bgImage from "../assets/22600173.png";
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
  audioFileId?: any;
  audio_file_id?: any;
  audiourl?: string;
  audioUrl?: string;
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

// 簡易 POST JSON（若你已有 asyncPostJson，可替換）
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
  // 依你的登入儲存方式調整（localStorage/sessionStorage…）
  // 假設登入後有存 userId
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
  const indexFromQuery = Number(query.get("index") || "0");

  const [cards, setCards] = useState<VocabCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState<string | null>(null);

  const [sentences, setSentences] = useState<Sentence[]>([]);
  const [flipped, setFlipped] = useState(false);

  // 收藏狀態：用 Set 快速查詢
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());

  // 目前索引
  const [currentIndex, setCurrentIndex] = useState(indexFromQuery >= 0 ? indexFromQuery : 0);

  // 音訊
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const userId = getUserId(); // 沒登入就 null → 星星會 disabled

  /* 讀取某分類的單字卡 */
  useEffect(() => {
    if (!effectiveCategoryId) return;

    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setErrMsg(null);

        const url = `${api.vocabCardsByCategory}/${encodeURIComponent(effectiveCategoryId)}`;
        const res = await asyncGet(url);
        const list: VocabCard[] = res?.body ?? res ?? [];
        if (!Array.isArray(list) || list.length === 0) throw new Error("此主題暫無單字卡");

        if (!cancelled) {
          setCards(list);
          const safeIndex = indexFromQuery >= 0 && indexFromQuery < list.length ? indexFromQuery : 0;
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
  }, [effectiveCategoryId, indexFromQuery]);

  /* 讀我的收藏清單（一次，避免每張卡都 call has） */
  useEffect(() => {
    if (!userId) {
      setFavoriteIds(new Set());
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await asyncGet(`${api.vocabCollectionList}/${encodeURIComponent(userId)}`);
        // 可能 body 是陣列，或 { vocabulary: [...] }
        const raw = res?.body ?? res ?? [];
        const list: any[] = Array.isArray(raw?.vocabulary) ? raw.vocabulary : Array.isArray(raw) ? raw : [];
        // 後端收藏的每一筆可能長這樣：
        // { _id, han, tl, ch } 或 { _id: <cardId> } 或 { vocabulary: [{ _id: <cardId>, ... }] }
        const set = new Set<string>();
        for (const item of list) {
          // 支援幾種形狀
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
  const currentCard = cards[currentIndex];

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
      } catch {
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
    if (!sentences.length) return null;
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
    // 樂觀更新
    if (next.has(cardId)) next.delete(cardId);
    else next.add(cardId);
    setFavoriteIds(next);

    try {
      await postJSON(api.vocabCollectionToggle, { userId, cardId });
      // 後端成功就不用動
    } catch (err) {
      // 失敗就回滾
      console.error("toggle favorite failed:", err);
      const rollback = new Set(next);
      if (rollback.has(cardId)) rollback.delete(cardId);
      else rollback.add(cardId);
      setFavoriteIds(rollback);
      alert("收藏狀態更新失敗，請稍後再試。");
    }
  };

  /* URL 同步 index */
  const updateIndexInUrl = (newIndex: number) => {
    const params = new URLSearchParams(location.search);
    params.set("index", String(newIndex));
    navigate(`${location.pathname}?${params.toString()}`, { replace: true });
  };

  /* 音訊控制（共用） */
  const stopAudio = () => {
    if (!audioRef.current) return;
    audioRef.current.pause();
    setIsPlaying(false);
  };

  const playPauseWithUrl = async (url: string | null) => {
    if (!url) return;
    try {
      if (!audioRef.current) {
        audioRef.current = new Audio();
        audioRef.current.preload = "auto";
        audioRef.current.crossOrigin = "anonymous";
        audioRef.current.addEventListener("ended", () => setIsPlaying(false));
        audioRef.current.addEventListener("pause", () => setIsPlaying(false));
        audioRef.current.addEventListener("play", () => setIsPlaying(true));
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
      alert("音檔播放失敗，可能尚未提供或 CORS 設定不足。");
    }
  };

  const frontAudioUrl = useMemo(() => {
    const audioKeyRaw = currentCard?.audio_file_id ?? currentCard?.audioId;
    const id = extractId(audioKeyRaw);
    if (!id) return null;
    return `${api.vocabAudioStream}/${encodeURIComponent(id)}?cb=${Date.now()}`;
  }, [currentCard]);

  const backAudioUrl = useMemo(() => {
    const direct = activeSentence?.audiourl || activeSentence?.audioUrl || "";
    if (direct) return direct;
    const audioKeyRaw = activeSentence?.audioFileId ?? activeSentence?.audio_file_id;
    const id = extractId(audioKeyRaw);
    if (!id) return null;
    return `${api.sentenceAudioStream}/${encodeURIComponent(id)}?cb=${Date.now()}`;
  }, [activeSentence]);

  /* 翻頁 */
  const handleNextCard = () => {
    if (currentIndex >= cards.length - 1) return;
    const newIndex = currentIndex + 1;
    setCurrentIndex(newIndex);
    updateIndexInUrl(newIndex);
    setFlipped(false);
    stopAudio();
  };
  const handlePrevCard = () => {
    if (currentIndex <= 0) return;
    const newIndex = currentIndex - 1;
    setCurrentIndex(newIndex);
    updateIndexInUrl(newIndex);
    setFlipped(false);
    stopAudio();
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
            <h1 className="header-title">台語單字卡</h1>
          </div>
        </header>
        <main className="flashcard-section">
          <img className="background-pattern" src={bgImage} alt="background pattern" />
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
        <img className="background-pattern" src={bgImage} alt="background pattern" />

        {loading && <div style={{ padding: 24, textAlign: "center", fontWeight: 700 }}>讀取中…</div>}
        {!loading && errMsg && (
          <div style={{ padding: 24, textAlign: "center", color: "#b00", fontWeight: 700 }}>
            {errMsg}
          </div>
        )}

        {!loading && !errMsg && cards.length > 0 && (
          <div className="flashcard-area">
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
                        <p key={`b-${i}`} className={`flashcard-text-line example-line ${i === 2 ? "flashcard-text-chinese" : ""}`}>
                          {line}
                        </p>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>

            <nav className="card-navigation">
              <button className="nav-arrow" aria-label="Previous card" onClick={handlePrevCard} disabled={currentIndex === 0}>
                <img src={leftArrow} alt="Previous" />
              </button>

              <span className="page-counter">
                {currentIndex + 1}/{cards.length}
              </span>

              <button className="nav-arrow" aria-label="Next card" onClick={handleNextCard} disabled={currentIndex === cards.length - 1}>
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
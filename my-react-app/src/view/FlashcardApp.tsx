// src/view/FlashcardApp.tsx
// 台語單字卡（串接 API 版，支援 index 與例句；優先 audiourl，含偵錯 log）

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

/** 單字卡 */
type VocabCard = {
  _id: string;
  han?: string;
  tl?: string;
  ch?: string;
  audio_file_id?: any;        // 可能是字串或物件
  // 相容欄位
  chinese?: string;
  word?: string;
  name?: string;
  audioId?: any;              // 可能是字串或物件
};

/** 例句 */
type Sentence = {
  _id: string;
  cardId?: string;
  han?: string;
  tl?: string;
  chinese?: string;
  ch?: string;
  // 音檔欄位（可能是任一種）
  audioFileId?: any;
  audio_file_id?: any;
  // 後端已組好的完整音檔 URL（優先使用）
  audiourl?: string;          // 蛇底線版本
  audioUrl?: string;          // 駝峰版本
  sentenceIndex?: number;
};

// 取 query string
const useQuery = () => new URLSearchParams(useLocation().search);

/** 從各種形狀抽出真正的 id 字串 */
function extractId(input: any): string {
  if (!input) return "";
  if (typeof input === "string") return input;

  if (typeof input === "object") {
    const candidates = [input._id, input.$oid, input.oid, input.id, input.value];
    for (const c of candidates) {
      if (typeof c === "string" && c.trim()) return c;
    }
  }

  if (Array.isArray(input)) {
    for (const item of input) {
      const v = extractId(item);
      if (v) return v;
    }
  }
  return "";
}

const FlashcardApp: React.FC = () => {
  const navigate = useNavigate();
  const { categoryId: paramCategoryId } = useParams<{ categoryId: string }>();
  const location = useLocation();
  const query = useQuery();

  // 支援 /FlashcardApp/:categoryId 與 ?categoryId=
  const queryCategoryId = query.get("categoryId") || undefined;
  const stateCategoryId = (location.state as any)?.categoryId as string | undefined;
  const effectiveCategoryId = paramCategoryId || queryCategoryId || stateCategoryId;

  // 顯示標題 & 初始索引
  const titleFromQuery = query.get("title") || "";
  const indexFromQuery = Number(query.get("index") || "0");

  // 單字卡
  const [cards, setCards] = useState<VocabCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState<string | null>(null);

  // 例句
  const [sentences, setSentences] = useState<Sentence[]>([]);

  // UI/互動
  const [flipped, setFlipped] = useState(false);
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});
  const [currentIndex, setCurrentIndex] = useState(indexFromQuery >= 0 ? indexFromQuery : 0);

  // 單一音訊播放器（正反面共用）
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  /** 讀取某分類的單字卡 */
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

        if (!Array.isArray(list) || list.length === 0) {
          throw new Error("此主題暫無單字卡");
        }

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

  /** 目前卡片 */
  const currentCard = cards[currentIndex];

  /** 切到某張卡時，載入該卡例句 */
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

  /** 正面三行：漢字 / 台羅 /（中文） */
  const frontLines = useMemo(() => {
    if (!currentCard) return [];
    const hanji = currentCard.han || currentCard.name || currentCard.word || "";
    const tailo = currentCard.tl || currentCard.word || "";
    const chineseRaw = currentCard.ch || currentCard.chinese || "";
    const chinese = chineseRaw ? `（${chineseRaw}）` : "";
    return [hanji, tailo, chinese].filter((s) => !!String(s || "").trim());
  }, [currentCard]);

  /** 背面：取與正面相同 index 的例句（若超出就取餘數） */
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

  /** 收藏（目前存在前端） */
  const handleFavoriteToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentCard?._id) return;
    setFavorites((prev) => ({ ...prev, [currentCard._id]: !prev[currentCard._id] }));
  };
  const isCurrentCardFavorited = currentCard?._id ? !!favorites[currentCard._id] : false;

  /** URL 同步 index */
  const updateIndexInUrl = (newIndex: number) => {
    const params = new URLSearchParams(location.search);
    params.set("index", String(newIndex));
    navigate(`${location.pathname}?${params.toString()}`, { replace: true });
  };

  /** 停止音訊 */
  const stopAudio = () => {
    if (!audioRef.current) return;
    audioRef.current.pause();
    setIsPlaying(false);
  };

  /** 共用的播放/暫停 */
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

  /** 正面單字音檔 URL（依你原本欄位規則） */
  const frontAudioUrl = useMemo(() => {
    const audioKeyRaw = currentCard?.audio_file_id ?? currentCard?.audioId;
    const id = extractId(audioKeyRaw);
    if (!id) return null;
    return `${api.vocabAudioStream}/${encodeURIComponent(id)}?cb=${Date.now()}`;
  }, [currentCard]);

  /** 背面例句音檔 URL —— ❶優先用後端給的完整 audiourl/audioUrl；❷沒有才用 ID 組 */
  const backAudioUrl = useMemo(() => {
    const direct =
      activeSentence?.audiourl ||
      activeSentence?.audioUrl ||
      "";

    if (direct) return direct;

    const audioKeyRaw = activeSentence?.audioFileId ?? activeSentence?.audio_file_id;
    const id = extractId(audioKeyRaw);
    if (!id) return null;

    return `${api.sentenceAudioStream}/${encodeURIComponent(id)}?cb=${Date.now()}`;
  }, [activeSentence]);

  /** 偵錯 log：快速核對 URL/ID 是否吻合後端 */
  useEffect(() => {
    if (!activeSentence && !currentCard) return;
    // 這個 log 只在你切卡/換例句時印一次
    console.log("[Sentence audio debug]", {
      cardId: currentCard?._id,
      activeSentence,
      preferUrl: activeSentence?.audiourl || activeSentence?.audioUrl || null,
      // 從欄位抽出的 ID（假如沒有 preferUrl）
      idFromField: extractId(activeSentence?.audioFileId ?? activeSentence?.audio_file_id) || null,
      finalUrlUsed: backAudioUrl,
    });
  }, [activeSentence, currentCard?._id, backAudioUrl]);

  /** 翻頁（同步 URL 並停止音訊） */
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

  /** 沒帶 categoryId */
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
            <div
              className={`flashcard ${flipped ? "flipped" : ""}`}
              onClick={() => setFlipped(!flipped)}
            >
              <div className="flashcard-inner">
                {/* Front — 單字 */}
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
                      aria-label="Add to favorites"
                      onClick={handleFavoriteToggle}
                    >
                      <img
                        src={starIcon}
                        alt="Star Icon"
                        className={`star-icon ${isCurrentCardFavorited ? "favorited" : ""}`}
                      />
                    </button>
                  </div>

                  <div className="flashcard-content">
                    {frontLines.map((line, i) => (
                      <p
                        key={`f-${i}`}
                        className={`flashcard-text-line ${i === 2 ? "flashcard-text-chinese" : ""}`}
                      >
                        {line}
                      </p>
                    ))}
                  </div>
                </div>

                {/* Back — 例句 */}
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
                      aria-label="Add to favorites"
                      onClick={handleFavoriteToggle}
                    >
                      <img
                        src={starIcon}
                        alt="Star Icon"
                        className={`star-icon ${isCurrentCardFavorited ? "favorited" : ""}`}
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

            <nav className="card-navigation">
              <button
                className="nav-arrow"
                aria-label="Previous card"
                onClick={handlePrevCard}
                disabled={currentIndex === 0}
              >
                <img src={leftArrow} alt="Previous" />
              </button>

              <span className="page-counter">
                {currentIndex + 1}/{cards.length}
              </span>

              <button
                className="nav-arrow"
                aria-label="Next card"
                onClick={handleNextCard}
                disabled={currentIndex === cards.length - 1}
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
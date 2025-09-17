// src/view/FavoriteCollectionPage.tsx
// 我的收藏集（相容兩種後端：cardId 列表 / vocabulary 文件）

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import backIcon from "../assets/Back.svg";
import volumeIcon from "../assets/volume up.svg";
import "../style/FavoriteCollectionPage.css";
import "../style/GameSelection.css";
import "../App.css";

import { api } from "../enum/api";
import { asyncGet, asyncPost } from "../utils/fetch";

/** ---- 型別 ---- */
type VocabMini = {
  _id: string;
  han?: string;
  tl?: string;
  ch?: string;
  category_id?: string | { _id?: string };
  audio_file_id?: any;
  // 相容舊欄位
  audioId?: any;
};

type FavoriteDoc = {
  _id: string;
  user_id: string;
  vocabulary: VocabMini[]; // 可能 1~N
};

type CollectionRow = { cardId: string; addedAt?: string }; // /vocab-collection/:userId 回傳的新格式

type Sentence = {
  _id: string;
  han?: string;
  tl?: string;
  chinese?: string;
  ch?: string;
  audiourl?: string;
  audioUrl?: string;
  audioFileId?: any;
  audio_file_id?: any;
};

/** ---- 小工具 ---- */
function getUserId(): string | null {
  return (
    localStorage.getItem("userId") ??
    localStorage.getItem("user_id") ??
    null
  );
}

function extractId(input: any): string {
  if (!input) return "";
  if (typeof input === "string") return input;
  if (Array.isArray(input)) {
    for (const v of input) {
      const got = extractId(v);
      if (got) return got;
    }
  }
  if (typeof input === "object") {
    const cands = [input._id, input.$oid, input.oid, input.id, input.value];
    for (const c of cands) if (typeof c === "string" && c.trim()) return c;
  }
  return "";
}

/** 盡力去拿單字詳情：用 /vocab-cards/:id */
async function fetchVocabDetailBestEffort(id: string): Promise<VocabMini | null> {
  try {
    const base = api.vocabCardsByCategory.replace("/by-category", ""); // 取出 /vocab-cards base
    // 你另外新增的 API：GET /api/v1/vocab-cards/:cardId
    const url = `${base}/${encodeURIComponent(id)}`;
    const res = await asyncGet(url);
    const body = res?.body ?? res;
    // 後端可能回物件或 {body: {...}}
    if (!body) return null;
    const v = (Array.isArray(body) ? body[0] : body) as any;
    if (!v || !v._id) return null;
    return {
      _id: v._id,
      han: v.han || v.name,
      tl: v.tl || v.word,
      ch: v.ch || v.chinese,
      category_id: v.category_id,
      audio_file_id: v.audio_file_id ?? v.audioId,
    };
  } catch {
    return null;
  }
}

/** 
 * 將字串中的括號用 span 包裹，同時對內容進行 HTML 跳脫以防止 XSS。
 * @param s 原始字串
 * @returns 包含安全 HTML 的字串
 */
const wrapParens = (s: string): string => {
  if (!s) return "";

  // 1. 先進行 HTML 跳脫，防止 XSS
  // 建立一個暫時的 div 元素，利用 textContent 的特性來進行跳脫
  const sanitizer = document.createElement('div');
  sanitizer.textContent = s;
  const sanitizedText = sanitizer.innerHTML;

  // 2. 對已經安全的文字進行樣式包裹
  return sanitizedText
    .replace(/\((.*?)\)/g, '<span class="thin-text">($1)</span>')
    .replace(/（(.*?)）/g, '<span class="thin-text">（$1）</span>');
};

const FavoriteCollectionPage: React.FC = () => {
  const navigate = useNavigate();
  const userId = useMemo(() => getUserId(), []);

  // 「扁平化後」可直接渲染的收藏卡片
  const [cards, setCards] = useState<VocabMini[]>([]);
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState<string | null>(null);

  // 翻面狀態（以卡片 id 為 key）
  const [flipped, setFlipped] = useState<Record<string, boolean>>({});

  // 例句快取：cardId -> sentences[]
  const [sentCache, setSentCache] = useState<Record<string, Sentence[]>>({});

  // 共用播放器
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  /** 讀取收藏清單（相容兩格式） */
  const fetchFavorites = async () => {
    if (!userId) {
      setErrMsg("尚未取得使用者 ID，請先登入。");
      return;
    }
    try {
      setLoading(true);
      setErrMsg(null);

      const url = `${api.vocabCollectionList}/${encodeURIComponent(userId)}`;
      const res = await asyncGet(url);
      const raw = res?.body ?? res ?? [];

      // A) 新格式：[{cardId, addedAt}]
      if (Array.isArray(raw) && raw.length && "cardId" in raw[0]) {
        const rows = raw as CollectionRow[];
        const details = await Promise.all(
          rows.map(r => fetchVocabDetailBestEffort(r.cardId))
        );
        setCards(details.filter(Boolean) as VocabMini[]);
        return;
      }

      // B) 舊格式：FavoriteDoc[]（每筆 doc 帶 vocabulary 陣列）
      if (Array.isArray(raw) && raw.length && raw[0]?.vocabulary) {
        const docs = (raw as FavoriteDoc[]).filter(
          d => String(d.user_id) === String(userId)
        );
        const flat = docs.flatMap(d => d.vocabulary || []);
        // 若 vocabulary 只有 {id}，也補齊一次
        const needsFetch = flat.filter(v => !v.han && !v.tl && !v.ch);
        if (needsFetch.length) {
          const fetched = await Promise.all(
            needsFetch.map(v => fetchVocabDetailBestEffort(v._id || (v as any).id))
          );
          const fetchedMap = new Map(
            fetched.filter(Boolean).map(v => [v!._id, v!])
          );
          const merged = flat.map(v => fetchedMap.get(v._id) || v);
          setCards(merged);
        } else {
          setCards(flat);
        }
        return;
      }

      // 其他不可辨識 → 視為空
      setCards([]);
    } catch (e: any) {
      setErrMsg(e?.message || "讀取收藏清單失敗");
      setCards([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  /** 切換收藏後，從畫面移除 */
  const toggleFavorite = async (cardId: string) => {
    if (!userId) return;
    try {
      await asyncPost(api.vocabCollectionToggle, { userId, cardId });
      setCards(prev => prev.filter(v => v._id !== cardId));
      setFlipped(prev => {
        const n = { ...prev };
        delete n[cardId];
        return n;
      });
    } catch {
      // 失敗就回補
      fetchFavorites();
    }
  };

  /** 播放/暫停（單一 <audio> 共用） */
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
    } catch {
      alert("音檔播放失敗，可能尚未提供。");
    }
  };

  const buildFrontAudioUrl = (v: VocabMini): string | null => {
    const id = extractId(v.audio_file_id) || extractId(v.audioId);
    if (!id) return null;
    return `${api.vocabAudioStream}/${encodeURIComponent(id)}?cb=${Date.now()}`;
    // 後端若提供完整 URL，也可直接回傳那個
  };

  const buildBackAudioUrl = (cardId: string): string | null => {
    const sents = sentCache[cardId];
    if (!sents || sents.length === 0) return null;
    const s = sents[0];
    const direct = s.audiourl || s.audioUrl;
    if (direct) return direct;
    const id = extractId(s.audioFileId) || extractId(s.audio_file_id);
    if (!id) return null;
    return `${api.sentenceAudioStream}/${encodeURIComponent(id)}?cb=${Date.now()}`;
  };

  /** 例句快取 */
  const ensureSentences = async (cardId: string) => {
    if (sentCache[cardId]) return;
    try {
      const url = `${api.sentenceByCard}/${encodeURIComponent(cardId)}`;
      const res = await asyncGet(url);
      const list: Sentence[] = res?.body ?? res ?? [];
      setSentCache(prev => ({ ...prev, [cardId]: Array.isArray(list) ? list : [] }));
    } catch {
      setSentCache(prev => ({ ...prev, [cardId]: [] }));
    }
  };

  /** 翻面 */
  const handleFlip = async (cardId: string) => {
    setFlipped(prev => ({ ...prev, [cardId]: !prev[cardId] }));
    if (!flipped[cardId]) await ensureSentences(cardId);
  };

  /** 渲染 */
  const renderFront = (v: VocabMini) => {
    const han = v.han || "—";
    const tl = v.tl || "";
    const zh = v.ch ? `（${v.ch}）` : "";
    return (
      <div className="favorite-word-stack">
        <p className="favorite-word-han">{han}</p>
        <p className="favorite-word-tl">{tl}</p>
        <p className="favorite-word-zh" dangerouslySetInnerHTML={{ __html: wrapParens(zh) }} />
      </div>
    );
  };

  const renderBack = (cardId: string) => {
    const s = sentCache[cardId]?.[0];
    if (!s) return <p className="favorite-sent-han">此單字暫無例句</p>;
    const han = s.han || "";
    const tl = s.tl || "";
    const zhRaw = s.ch || s.chinese || "";
    const zh = zhRaw ? `（${zhRaw}）` : "";
    return (
      <div className="favorite-sentence-stack">
        <p className="favorite-sent-han">{han}</p>
        {tl && <p className="favorite-sent-tl">{tl}</p>}
        {zh && <p className="favorite-sent-zh" dangerouslySetInnerHTML={{ __html: wrapParens(zh) }} />}
      </div>
    );
  };

  return (
    <div className="selection-bg">
      <header className="selection-header">
        <button type="button" className="back-button" aria-label="返回" onClick={() => navigate(-1)}>
          <img src={backIcon} alt="返回" />
        </button>
        <h1 className="header-title">我的收藏集</h1>
      </header>

      <main className="game-selection-main">
        {loading && <p style={{ textAlign: "center" }}>讀取中…</p>}
        {!loading && errMsg && <p style={{ textAlign: "center", color: "#b00" }}>{errMsg}</p>}
        {!loading && !errMsg && cards.length === 0 && <p style={{ textAlign: "center" }}>目前沒有收藏的單字卡</p>}

        {!loading && !errMsg && cards.length > 0 && (
          <div className="favorite-cards-grid">
            {cards.map((v) => {
              const cardId = v._id;
              const isFlipped = !!flipped[cardId];
              const frontAudioUrl = buildFrontAudioUrl(v);
              const backAudioUrl = buildBackAudioUrl(cardId);

              return (
                <div
                  key={cardId}
                  className={`favorite-flashcard ${isFlipped ? "flipped" : ""}`}
                  onClick={() => handleFlip(cardId)}
                >
                  <div className="favorite-flashcard-inner">
                    {/* Front */}
                    <div className="favorite-flashcard-front">
                      <div className="favorite-card-icons">
                        <button
                          className="favorite-icon-button"
                          aria-label="播放單字音檔"
                          onClick={(e) => {
                            e.stopPropagation();
                            playPauseWithUrl(frontAudioUrl);
                          }}
                          disabled={!frontAudioUrl}
                          title={!frontAudioUrl ? "暫無音檔" : "播放"}
                        >
                          <img src={volumeIcon} alt="Volume Icon" />
                        </button>
                      </div>
                      <div className="favorite-flashcard-content">{renderFront(v)}</div>
                      <button
                        className="delete-button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(cardId);
                        }}
                      >
                        刪除
                      </button>
                    </div>

                    {/* Back */}
                    <div className="favorite-flashcard-back">
                      <div className="favorite-card-icons">
                        <button
                          className="favorite-icon-button"
                          aria-label="播放例句音檔"
                          onClick={(e) => {
                            e.stopPropagation();
                            ensureSentences(cardId).then(() =>
                              playPauseWithUrl(buildBackAudioUrl(cardId))
                            );
                          }}
                          disabled={!backAudioUrl && !(sentCache[cardId]?.length)}
                          title={!backAudioUrl && !(sentCache[cardId]?.length) ? "暫無音檔" : "播放"}
                        >
                          <img src={volumeIcon} alt="Volume Icon" />
                        </button>
                      </div>
                      <div className="favorite-flashcard-content">{renderBack(cardId)}</div>
                      <button
                        className="delete-button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(cardId);
                        }}
                      >
                        刪除
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default FavoriteCollectionPage;
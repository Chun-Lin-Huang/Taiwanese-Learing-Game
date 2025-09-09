// src/view/ThemeSelectionPage.tsx
import { useRef, useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";
import BackIcon from "../assets/Back.svg";
import favoriteIcon from "../assets/收藏.svg";

import fallbackImg from "../assets/森林俱樂部.png";

import { api } from "../enum/api";
import { asyncGet } from "../utils/fetch";

type VocabCategory = {
  _id: string;
  name: string;
  imageUrl?: string;
  imageurl?: string;
};

type Card = {
  id: string;
  title: string;
  img: string;
};

export default function ThemeSelectionPage() {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);

  const [focusedIndex, setFocusedIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState<string | null>(null);
  const [categories, setCategories] = useState<VocabCategory[]>([]);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setErrMsg(null);
        const res = await asyncGet(api.vocabCategoriesList);
        const list: VocabCategory[] = res?.body ?? res ?? [];
        setCategories(Array.isArray(list) ? list : []);
      } catch (e) {
        console.error(e);
        setErrMsg("讀取主題清單失敗");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const cards: Card[] = useMemo(() => {
    if (!categories.length) return [];
    return categories.map((c) => {
      const streamUrl = `${api.vocabCategoryImage}/${encodeURIComponent(c._id)}`;
      const img = c.imageUrl || c.imageurl || streamUrl;
      return { id: c._id, title: c.name, img };
    });
  }, [categories]);

  const duplicatedCards: Card[] = useMemo(() => {
    if (!cards.length) return [];
    return [...cards, ...cards, ...cards, ...cards, ...cards];
  }, [cards]);

  /** 👉 點卡片導頁：帶上 index=0 */
  const onCardClick = useCallback(
    (card: Card) => {
      const params = new URLSearchParams({
        categoryId: card.id,
        title: card.title,
        index: "0", // 預設第一張
      });
      navigate(`/FlashcardApp?${params.toString()}`);
    },
    [navigate]
  );

  const getCardDimensions = useCallback(() => {
    const container = containerRef.current;
    if (!container) return { cardWidth: 0, gap: 0, paddingLeftValue: 0, totalCardSpace: 0 };

    const singleCardElement = container.querySelector(".card-wrapper");
    if (!singleCardElement) return { cardWidth: 0, gap: 0, paddingLeftValue: 0, totalCardSpace: 0 };

    const cardWidth = (singleCardElement as HTMLElement).getBoundingClientRect().width;
    const styles = getComputedStyle(container.querySelector(".modes-container") as Element);
    const gap = parseFloat(styles.gap || "0");
    const paddingLeftValue = parseFloat(styles.paddingLeft || "0");
    const totalCardSpace = cardWidth + gap;
    return { cardWidth, gap, paddingLeftValue, totalCardSpace };
  }, []);

  const scrollToCard = useCallback(
    (index: number, smooth: boolean = true) => {
      const container = containerRef.current;
      if (!container || !cards.length) return;

      const { totalCardSpace, paddingLeftValue } = getCardDimensions();
      const n = cards.length;
      const i = ((index % n) + n) % n;
      const targetScrollLeft = (n * 2 + i) * totalCardSpace - paddingLeftValue;
      container.scrollTo({ left: targetScrollLeft, behavior: smooth ? "smooth" : "auto" });
    },
    [cards.length, getCardDimensions]
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !cards.length) return;

    const { totalCardSpace, paddingLeftValue } = getCardDimensions();
    const n = cards.length;
    const sections = 5;

    container.scrollLeft = n * totalCardSpace * Math.floor(sections / 2) - paddingLeftValue;

    const handleScroll = () => {
      const scrollLeft = container.scrollLeft;
      const clientWidth = container.clientWidth;
      const effectiveScrollLeft = scrollLeft + paddingLeftValue;
      const sectionWidth = n * totalCardSpace;
      const mid = Math.floor(sections / 2);
      const threshold = totalCardSpace;

      if (effectiveScrollLeft > (mid + 1) * sectionWidth - threshold) {
        container.scroll({ left: effectiveScrollLeft - sectionWidth - paddingLeftValue, behavior: "auto" });
      } else if (effectiveScrollLeft < mid * sectionWidth + threshold) {
        container.scroll({ left: effectiveScrollLeft + sectionWidth - paddingLeftValue, behavior: "auto" });
      }

      const viewportCenter = scrollLeft + clientWidth / 2;
      let closest = 0;
      let minDistance = Infinity;

      const cardsDom = Array.from(container.querySelectorAll(".game-card"));
      cardsDom.forEach((el, i) => {
        const rect = (el as HTMLElement).getBoundingClientRect();
        const centerAbs = rect.left + scrollLeft + rect.width / 2;
        const d = Math.abs(centerAbs - viewportCenter);
        if (d < minDistance) {
          minDistance = d;
          closest = i;
        }
      });

      setFocusedIndex(closest % n);
    };

    // 處理滑鼠滾輪和觸控板事件
    const handleWheel = (e: WheelEvent) => {
      // 檢查是否為水平滾動（觸控板通常會有 deltaX）
      const isHorizontalScroll = Math.abs(e.deltaX) > Math.abs(e.deltaY);
      
      if (isHorizontalScroll) {
        // 水平滾動：讓觸控板自然處理
        return;
      } else {
        // 垂直滾動：轉換為水平滾動
        e.preventDefault();
        const delta = e.deltaY;
        const scrollAmount = delta * 0.5; // 調整滾動速度
        container.scrollLeft += scrollAmount;
      }
    };

    const tid = setTimeout(() => {
      handleScroll();
      container.addEventListener("scroll", handleScroll);
      container.addEventListener("wheel", handleWheel, { passive: false });
    }, 100);

    return () => {
      clearTimeout(tid);
      container.removeEventListener("scroll", handleScroll);
      container.removeEventListener("wheel", handleWheel);
    };
  }, [cards.length, getCardDimensions]);

  return (
    <div className="selection-bg">
      <header className="selection-header">
        <div className="header-left">
          <button type="button" className="back-button" aria-label="返回" onClick={() => navigate("/Learn")}>
            <img src={BackIcon} alt="返回" />
          </button>
          <h1 className="game-header-title">台語單字卡</h1>
        </div>

        <button
          type="button"
          aria-label="前往收藏集"
          className="favorite-collection-btn"
          onClick={() => navigate("/favorites")}
        >
          <img src={favoriteIcon} alt="收藏集" className="favorite-icon" />
          <span className="favorite-text">收藏集</span>
        </button>
      </header>

      <main className="game-selection-main">
        <div className="title-container">
          <h2 className="selection-title">主題選擇</h2>
        </div>

        {loading && <p style={{ textAlign: "center" }}>載入中…</p>}
        {!loading && errMsg && <p style={{ textAlign: "center", color: "#b00" }}>{errMsg}</p>}
        {!loading && !errMsg && cards.length === 0 && <p style={{ textAlign: "center" }}>目前沒有主題</p>}

        {cards.length > 0 && (
          <div className="cards-container" ref={containerRef}>
            <div className="modes-container">
              {duplicatedCards.map((card, idx) => (
                <div key={`${card.id}-${idx}`} className="card-wrapper">
                  <button
                    className={`game-card${focusedIndex === idx % cards.length ? " focused" : ""}`}
                    onClick={() => onCardClick(card)}
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        onCardClick(card);
                      } else if (e.key === "ArrowRight") {
                        e.preventDefault();
                        scrollToCard(focusedIndex + 1);
                      } else if (e.key === "ArrowLeft") {
                        e.preventDefault();
                        scrollToCard(focusedIndex - 1);
                      }
                    }}
                    style={{ cursor: "pointer" }}
                  >
                    <img
                      src={card.img}
                      alt={card.title.replace(/\n/g, "")}
                      className="active-card-image"
                      onError={(e) => {
                        const img = e.currentTarget as HTMLImageElement;
                        if (!img.dataset.fallback) {
                          img.src = fallbackImg;
                          img.dataset.fallback = "1";
                        }
                      }}
                    />
                    <div className="active-card-title">
                      {card.title.split("\n").map((line, i) => (
                        <span key={i}>
                          {line}
                          <br />
                        </span>
                      ))}
                    </div>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
import { useRef, useState, useEffect, useCallback } from "react";
import "../App.css";
import BackIcon from "../assets/Back.svg";
import nature from "../assets/森林俱樂部.png";
import sport from "../assets/大家一起動一動.png";
import place from "../assets/植物百寶袋.png";
import clothes from "../assets/穿搭小百科.png";
import car from "../assets/誰是交通王.png";
import food from "../assets/食物探險家.png";
import building from "../assets/建築空間探險去.png";
import appliances from "../assets/家用品大揭秘.png";
import { useNavigate } from "react-router-dom";

import { api } from "../enum/api";
import { asyncGet } from "../utils/fetch";

const cards = [
  { title: "家用品大揭秘", img: appliances, path: "/AppliancesGame" },
  { title: "建築空間探索去", img: building, path: "/BuildingGame" },
  { title: "森林\n俱樂部",   img: nature,     path: "/nature-game" },
  { title: "大家一起動一動", img: sport,      path: "/sportGame" },
  { title: "植物百寶袋",     img: place,      path: "/PlaceGame" },
  { title: "穿搭小百科",     img: clothes,    path: "/ClothesGame" },
  { title: "誰是交通王",     img: car,        path: "/CarGame" },
  { title: "美食探索家",     img: food,       path: "/FoodGame" },
];

export default function GameSelection2() {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const [focusedIndex, setFocusedIndex] = useState(0);

  const duplicatedCards = [...cards, ...cards, ...cards, ...cards, ...cards];

  // 依名稱以 GET 換分類 ID，支援 ?name= 與 /:name 兩種寫法
  const enterCategory = useCallback(
    async (card: { title: string; img: string }) => {
      const nameForApi = card.title.replace(/\n/g, "");
      const q = encodeURIComponent(nameForApi);

      let data: any;
      try {
        // ① 先試 ?name=
        data = await asyncGet(`${api.categoryIdByName}?name=${q}`);
      } catch (e1) {
        try {
          // ② 後備方案：/:name
          data = await asyncGet(`${api.categoryIdByName}/${q}`);
        } catch (e2) {
          alert("取得分類 ID 失敗，請稍後再試");
          console.error(e1, e2);
          return;
        }
      }

      const body = data?.body ?? data;
      const categoryId: string | undefined = body?._id || body?.id;
      if (!categoryId) {
        alert("回應缺少分類 ID");
        return;
      }

      // 存到 localStorage，給 GameMain / 題目頁使用
      localStorage.setItem("gameCategoryId", categoryId);
      localStorage.setItem("gameCategoryName", body?.name || nameForApi);
      if (body?.vocName) localStorage.setItem("gameCategoryVoc", body.vocName);
      localStorage.setItem("gameBg", card.img);

      // 帶狀態進 GameMain
      navigate("/GameMain", { state: { theme: card, categoryId } });
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

  const scrollToCard = useCallback((index: number, smooth: boolean = true) => {
    const container = containerRef.current;
    if (!container) return;

    const { totalCardSpace, paddingLeftValue } = getCardDimensions();
    const numOriginalCards = cards.length;
    const targetScrollLeft = (numOriginalCards * 2 + index) * totalCardSpace - paddingLeftValue;

    container.scrollTo({ left: targetScrollLeft, behavior: smooth ? "smooth" : "auto" });
  }, [getCardDimensions]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const { totalCardSpace, paddingLeftValue } = getCardDimensions();
    const numOriginalCards = cards.length;
    const numDuplicatedSections = 5;

    const initialScrollPosition =
      numOriginalCards * totalCardSpace * Math.floor(numDuplicatedSections / 2) - paddingLeftValue;
    container.scrollLeft = initialScrollPosition;

    const handleScroll = () => {
      const scrollLeft = container.scrollLeft;
      const clientWidth = container.clientWidth;
      const effectiveScrollLeft = scrollLeft + paddingLeftValue;
      const sectionWidth = numOriginalCards * totalCardSpace;
      const middleSectionIndex = Math.floor(numDuplicatedSections / 2);
      const threshold = 1 * totalCardSpace;

      if (effectiveScrollLeft > (middleSectionIndex + 1) * sectionWidth - threshold) {
        container.scroll({ left: effectiveScrollLeft - sectionWidth - paddingLeftValue, behavior: "auto" });
      } else if (effectiveScrollLeft < middleSectionIndex * sectionWidth + threshold) {
        container.scroll({ left: effectiveScrollLeft + sectionWidth - paddingLeftValue, behavior: "auto" });
      }

      const viewportCenter = scrollLeft + clientWidth / 2;
      let closestCardIndex = 0;
      let minDistance = Infinity;

      const cardsDom = Array.from(container.querySelectorAll(".game-card"));
      cardsDom.forEach((card, index) => {
        const rect = (card as HTMLElement).getBoundingClientRect();
        const cardCenterAbs = rect.left + scrollLeft + rect.width / 2;
        const distance = Math.abs(cardCenterAbs - viewportCenter);
        if (distance < minDistance) {
          minDistance = distance;
          closestCardIndex = index;
        }
      });

      setFocusedIndex(closestCardIndex % cards.length);
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
  }, [getCardDimensions]);

  return (
    <div className="selection-bg">
      <header className="selection-header">
        <button type="button" className="back-button" aria-label="返回" onClick={() => navigate("/Learn")}>
          <img src={BackIcon} alt="返回" />
        </button>
        <h1 className="game-header-title">互動遊戲</h1>
      </header>

      <main className="game-selection-main">
        <div className="title-container">
          <h2 className="selection-title">主題模式</h2>
        </div>

        <div className="cards-container" ref={containerRef}>
          <div className="modes-container">
            {duplicatedCards.map((card, idx) => (
              <div key={idx} className="card-wrapper">
                <button
                  className={`game-card${focusedIndex === idx % cards.length ? " focused" : ""}`}
                  onClick={() => enterCategory(card)}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      enterCategory(card);
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
                  <img src={card.img} alt={card.title.replace(/\n/g, "")} className="active-card-image" />
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
      </main>
    </div>
  );
}
import { useRef, useState, useEffect, useCallback } from "react"; // Added useCallback
//import "../style/GameSelection.css";
import "../App.css"
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

const cards = [
    {
    title: "家用品大揭秘",
    img: appliances,
    path: "/AppliancesGame",
  },
    {
    title: "建築空間探險去",
    img: building,
    path: "/BuildingGame",
  },
  {
    title: "森林\n俱樂部",
    img: nature,
    path: "/nature-game",
  },
  {
    title: "大家一起動一動",
    img: sport,
     path: "/sportGame",
  },
  {
    title: "植物百寶袋",
    img: place,
    path: "/PlaceGame",
  },
  {
    title: "穿搭小百科",
    img: clothes,
    path: "/ClothesGame",
  },
  {
    title: "誰是交通王",
    img: car,
    path: "/CarGame",
  },
  {
    title: "美食探險家",
    img: food,
    path: "/FoodGame",
  },
];

export default function GameSelection() {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const [focusedIndex, setFocusedIndex] = useState(0);
  

  // 更多次的複製，提供更長的緩衝區
  const duplicatedCards = [...cards, ...cards, ...cards, ...cards, ...cards]; // 複製 5 次

  // 計算卡片相關尺寸的函數，避免重複計算
  const getCardDimensions = useCallback(() => {
    const container = containerRef.current;
    if (!container) return { cardWidth: 0, gap: 0, paddingLeftValue: 0, totalCardSpace: 0 };

    const singleCardElement = container.querySelector(".card-wrapper");
    if (!singleCardElement) return { cardWidth: 0, gap: 0, paddingLeftValue: 0, totalCardSpace: 0 };

    const cardWidth = singleCardElement.getBoundingClientRect().width;
    const modesContainerStyle = getComputedStyle(container.querySelector(".modes-container")!);
    const gap = parseFloat(modesContainerStyle.gap || "0px"); // Ensure gap is parsed correctly
    const paddingLeftString = modesContainerStyle.paddingLeft;
    const paddingLeftValue = parseFloat(paddingLeftString.replace('px', '')) || 0;

    const totalCardSpace = cardWidth + gap;
    return { cardWidth, gap, paddingLeftValue, totalCardSpace };
  }, []); // No dependencies, as dimensions are fixed after mount

  // 滾動到特定卡片索引的函數
  const scrollToCard = useCallback((index: number, smooth: boolean = true) => {
    const container = containerRef.current;
    if (!container) return;

    const { totalCardSpace, paddingLeftValue } = getCardDimensions();
    const numOriginalCards = cards.length;

    // 目標滾動位置是中間那組卡片中對應索引的位置
    const targetScrollLeft = (numOriginalCards * 2 + index) * totalCardSpace - paddingLeftValue;

    container.scrollTo({
      left: targetScrollLeft,
      behavior: smooth ? 'smooth' : 'auto' // 可以選擇平滑滾動或直接跳轉
    });
  }, [getCardDimensions]); // Depend on getCardDimensions

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const { totalCardSpace, paddingLeftValue } = getCardDimensions();
    const numOriginalCards = cards.length;
    const numDuplicatedSections = 5; // 與 duplicatedCards 的複製次數一致

    // 初始滾動到中央區域 (第二組原始卡片區塊的開始)
    // 這樣向左向右都有足夠的緩衝區
    // 我們希望初始在第二個 'cards' 區域的開頭
    const initialScrollPosition = numOriginalCards * totalCardSpace * Math.floor(numDuplicatedSections / 2) - paddingLeftValue;

    container.scrollLeft = initialScrollPosition;


    const handleScroll = () => {
      const scrollLeft = container.scrollLeft;
      const clientWidth = container.clientWidth;

      // 考慮到 paddingLeftValue，獲取實際的內容滾動位置
      const effectiveScrollLeft = scrollLeft + paddingLeftValue;

      // 計算每個原始卡片區塊的總寬度
      const sectionWidth = numOriginalCards * totalCardSpace;

      // 找出目前滾動位置在哪個區塊 (0, 1, 2, 3, 4...)
      // 使用 Math.round 而非 floor/ceil 可以減少浮點數誤差導致的過早或過晚判斷
      const currentSectionIndex = Math.round(effectiveScrollLeft / sectionWidth);

      // 我們希望使用者大部分時間停留在中間的區塊 (通常是第二或第三個區塊，取決於複製次數)
      const middleSectionIndex = Math.floor(numDuplicatedSections / 2); // 例如複製5次，中間是第2個區塊 (索引從0開始)

      // 如果滾動位置離開了中間的「緩衝區」，就進行跳轉
      // 我們設定一個閾值，例如當滾動到距離區塊邊緣一個卡片距離時就跳轉
      const threshold = 1 * totalCardSpace; // 假設閾值為一張卡片的寬度

      // 向右滾動太遠，進入後面的複製區塊
      if (effectiveScrollLeft > (middleSectionIndex + 1) * sectionWidth - threshold) {
        // 跳轉到中間區塊的對應位置
        const newScrollLeft = effectiveScrollLeft - sectionWidth - paddingLeftValue;
        container.scroll({ left: newScrollLeft, behavior: 'auto' }); // 直接跳轉，非平滑
      }
      // 向左滾動太遠，進入前面的複製區塊
      else if (effectiveScrollLeft < (middleSectionIndex) * sectionWidth + threshold) {
        // 跳轉到中間區塊的對應位置
        const newScrollLeft = effectiveScrollLeft + sectionWidth - paddingLeftValue;
        container.scroll({ left: newScrollLeft, behavior: 'auto' }); // 直接跳轉，非平滑
      }


      // 判斷目前哪個卡片聚焦 (中心對齊)
      const viewportCenter = scrollLeft + clientWidth / 2;
      let closestCardIndex = 0;
      let minDistance = Infinity;

      const cardsDom = Array.from(container.querySelectorAll(".game-card"));
      cardsDom.forEach((card, index) => {
        const rect = (card as HTMLElement).getBoundingClientRect();
        // 卡片中心相對於滾動容器的絕對位置
        const cardCenterAbs = rect.left + scrollLeft + rect.width / 2;
        const distance = Math.abs(cardCenterAbs - viewportCenter);

        if (distance < minDistance) {
          minDistance = distance;
          closestCardIndex = index;
        }
      });

      // 將複製的索引映射回原始卡片索引
      setFocusedIndex(closestCardIndex % numOriginalCards);
    };

    // 初始設置和監聽滾動事件
    const timeoutId = setTimeout(() => {
      handleScroll(); // 確保初始狀態正確
      container.addEventListener("scroll", handleScroll);
    }, 100); // 稍微增加延遲確保DOM完全渲染

    return () => {
      clearTimeout(timeoutId);
      container.removeEventListener("scroll", handleScroll);
    };
  }, [cards.length, getCardDimensions]); // Depend on getCardDimensions

  return (
    <div className="selection-bg">
      <header className="selection-header">
        <button
          type="button"
          className="back-button"
          aria-label="返回"
          onClick={() => navigate("/Learn")}
        >
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
                  onClick={() => card.path && navigate(card.path)}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      card.path && navigate(card.path);
                    }
                    if (e.key === "ArrowRight") {
                      e.preventDefault();
                      // 平滑滾動到下一張卡片
                      scrollToCard(focusedIndex + 1);
                    } else if (e.key === "ArrowLeft") {
                      e.preventDefault();
                      // 平滑滾動到上一張卡片
                      scrollToCard(focusedIndex - 1);
                    }
                  }}
                  style={{ cursor: card.path ? "pointer" : "default" }}
                >
                  <img
                    src={card.img}
                    alt={card.title.replace(/\n/g, "")}
                    className="active-card-image"
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
      </main>
    </div>
  );
}
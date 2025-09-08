import { useRef, useState, useEffect, useCallback } from "react";
import "../style/LearningMode.css";
import bellIcon from "../assets/icon-bell.png";
import gearIcon from "../assets/icon-gear.png";
import userIcon from "../assets/icon-user.png";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

type UserInfo = {
  _id: string;
  name?: string;
  userName?: string;
};

const cards = [
  { title: "台語\n單字卡", path: "/ThemeSelection" },
  { title: "情境\n對話", path: "/Home" },
  { title: "互動\n遊戲", path: "/GameSelection2" },
  { title: "台語\n故事集", path: "/StoryModePage" },
  { title: "大富翁", path: "/MonopolyPage" },
  { title: "台語\n辭典", path: "/DictionaryPage" },
];

export default function LearningMode() {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [greetingName, setGreetingName] = useState("您好");

  // 把卡片重複 5 組，形成無限滾動效果
  const duplicatedCards = [...cards, ...cards, ...cards, ...cards, ...cards];

  // 初始化名稱
  useEffect(() => {
    try {
      const raw = localStorage.getItem("userInfo");
      if (raw) {
        const info = JSON.parse(raw) as UserInfo;
        const name = info?.name || info?.userName;
        if (name) setGreetingName(`Hello, ${name}`);
      }
    } catch {}
  }, []);

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
      if (!container) return;

      const { totalCardSpace, paddingLeftValue } = getCardDimensions();
      const numOriginalCards = cards.length;
      const targetScrollLeft = (numOriginalCards * 2 + index) * totalCardSpace - paddingLeftValue;

      container.scrollTo({ left: targetScrollLeft, behavior: smooth ? "smooth" : "auto" });
    },
    [getCardDimensions]
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const { totalCardSpace, paddingLeftValue } = getCardDimensions();
    const numOriginalCards = cards.length;
    const numDuplicatedSections = 5;

    // 初始位置：中間那組
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

      // 無限循環
      if (effectiveScrollLeft > (middleSectionIndex + 1) * sectionWidth - threshold) {
        container.scroll({ left: effectiveScrollLeft - sectionWidth - paddingLeftValue, behavior: "auto" });
      } else if (effectiveScrollLeft < middleSectionIndex * sectionWidth + threshold) {
        container.scroll({ left: effectiveScrollLeft + sectionWidth - paddingLeftValue, behavior: "auto" });
      }

      // 找出置中的卡片
      const viewportCenter = scrollLeft + clientWidth / 2;
      let closestCardIndex = 0;
      let minDistance = Infinity;

      const cardsDom = Array.from(container.querySelectorAll(".learn-card"));
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

    const tid = setTimeout(() => {
      handleScroll();
      container.addEventListener("scroll", handleScroll);
    }, 100);

    return () => {
      clearTimeout(tid);
      container.removeEventListener("scroll", handleScroll);
    };
  }, [getCardDimensions]);

  const handleLogout = () => {
    localStorage.removeItem("userId");
    localStorage.removeItem("userInfo");
    localStorage.removeItem("token");
    toast.success("已登出，下次見！", { onClose: () => navigate("/login") });
  };

  return (
    <div className="learning-page selection-bg learn-selection-bg">
      <ToastContainer />
      <header className="selection-header">
        <p className="greeting-title">{greetingName}</p>
        <div className="nav-actions">
          <button className="nav-button" onClick={() => navigate("/NotificationPage")}>
            <img src={bellIcon} alt="通知" className="nav-icon" />
            <span className="nav-label">通知</span>
          </button>
          <button className="nav-button" onClick={() => navigate("/SettingsPage")}>
            <img src={gearIcon} alt="設定" className="nav-icon" />
            <span className="nav-label">設定</span>
          </button>
          <button className="nav-button" onClick={handleLogout}>
            <img src={userIcon} alt="登出" className="nav-icon" />
            <span className="nav-label">登出</span>
          </button>
        </div>
      </header>

      <main className="learn-selection-main">
        <div className="learn-cards-container" ref={containerRef}>
          <div className="modes-container">
            {duplicatedCards.map((card, idx) => (
              <div key={idx} className="card-wrapper">
                <button
                  className={`learn-card${focusedIndex === idx % cards.length ? " focused" : ""}`}
                  onClick={() => card.path && navigate(card.path)}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      card.path && navigate(card.path);
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
                  <div className="learn-active-card-title">
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
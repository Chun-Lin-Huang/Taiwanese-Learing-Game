//一直暴路徑有問題 不知想怎

import React from "react";
import { useNavigate } from "react-router-dom";
import "../App2.css";
import "../style/NotificationPage.css";
import bellIcon from "../assets/icon-bell.png";
import unreadDotIcon from "../assets/unRead_dot.png";
import BackIcon from "../assets/Back.svg";


interface NotificationItem {
  id: number;
  text?: string;
  time: string;
  iconSrc: string;
  unreadDotSrc?: string;
}

const data: NotificationItem[] = [
  {
    id: 1,
    text: "快來跟小熊聊天吧！",
    time: "12:15",
    // 使用匯入的變數，而不是相對路徑
    iconSrc: bellIcon,
    unreadDotSrc: unreadDotIcon,
  },
  {
    id: 2,
    text: "今天練習的新單字：「哩賀」",
    time: "10:30",
    iconSrc: bellIcon,
  },
  { id: 3, time: "16:15", iconSrc: bellIcon },
  { id: 4, time: "12:00", iconSrc: bellIcon },
  { id: 5, time: "12:00", iconSrc: bellIcon },
  { id: 6, time: "12:00", iconSrc: bellIcon },
  { id: 7, time: "16:15", iconSrc: bellIcon },
  { id: 8, time: "16:15", iconSrc: bellIcon },
];

const NotificationPage: React.FC = () => {
  const navigate = useNavigate();

  const handleBack = () => navigate(-1);
  const handleClear = () => {
    alert("清除通知（示意）");
  };

  return (
    <div className="page-bg notification-page">
      <header className="game-header">
        <button
          type="button"
          className="back-button"
          aria-label="返回"
          onClick={() => navigate("/Learn")}
        >
          <img src={BackIcon} alt="返回" />
        </button>
        <h1 className="header-title">通知</h1>
        <button className="clear-button" onClick={handleClear}>清除</button>
      </header>

      <main className="notifications-list-container">
        <div className="notifications-list">
          {data.map((item) => (
            <article key={item.id} className="notification-item">
              <div className="icon-wrapper">
                <img src={item.iconSrc} alt="Notification Bell" className="bell-icon" />
                {item.unreadDotSrc && (
                  <img src={item.unreadDotSrc} alt="Unread Indicator" className="unread-dot" />
                )}
              </div>
              {item.text && <p className="notification-text">{item.text}</p>}
              <time className="notification-time">{item.time}</time>
            </article>
          ))}
        </div>
      </main>
    </div>
  );
};

export default NotificationPage;

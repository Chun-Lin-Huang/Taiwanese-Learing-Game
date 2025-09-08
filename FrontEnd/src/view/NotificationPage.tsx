import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../App2.css";
import "../style/NotificationPage.css";
import bellIcon from "../assets/icon-bell.png";
import unreadDotIcon from "../assets/unRead_dot.png";
import BackIcon from "../assets/Back.svg";
import { api } from "../enum/api";
import { asyncGet } from "../utils/fetch";


interface NotificationItem {
  id: string;
  text: string;
  time: string;
  iconSrc: string;
  unreadDotSrc?: string;
  type: 'learning' | 'general' | 'achievement';
  categoryTitle?: string;
  progress?: number;
  total?: number;
}

// 獲取用戶ID的函數
function getUserId(): string | null {
  return localStorage.getItem("userId");
}

// 格式化時間
function formatTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (minutes < 1) return "剛剛";
  if (minutes < 60) return `${minutes}分鐘前`;
  if (hours < 24) return `${hours}小時前`;
  if (days < 7) return `${days}天前`;
  
  return date.toLocaleDateString('zh-TW', { 
    month: '2-digit', 
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}

const NotificationPage: React.FC = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  // 載入學習進度通知
  useEffect(() => {
    const loadNotifications = async () => {
      try {
        setLoading(true);
        const userId = getUserId();
        if (!userId) {
          setNotifications([]);
          return;
        }

        // 載入學習進度數據
        const progressRes = await asyncGet(`${api.vocabProgressAll}/${encodeURIComponent(userId)}`);
        const progressData = progressRes?.body || [];

        // 轉換為通知格式
        const learningNotifications: NotificationItem[] = progressData.map((item: any, index: number) => ({
          id: `learning-${item.categoryId}-${index}`,
          text: `完成「${item.categoryTitle || '未知分類'}」學習進度 ${Math.round(((item.currentIndex + 1) / item.total) * 100)}%`,
          time: formatTime(new Date(item.updatedAt || Date.now())),
          iconSrc: bellIcon,
          unreadDotSrc: unreadDotIcon,
          type: 'learning' as const,
          categoryTitle: item.categoryTitle,
          progress: item.currentIndex + 1,
          total: item.total
        }));

        // 添加一些示例通知
        const sampleNotifications: NotificationItem[] = [
          {
            id: 'welcome-1',
            text: '歡迎使用台語學習系統！開始您的學習之旅吧！',
            time: formatTime(new Date(Date.now() - 2 * 60 * 60 * 1000)), // 2小時前
            iconSrc: bellIcon,
            unreadDotSrc: unreadDotIcon,
            type: 'general'
          },
          {
            id: 'achievement-1',
            text: '恭喜！您已連續學習 3 天，保持這個好習慣！',
            time: formatTime(new Date(Date.now() - 24 * 60 * 60 * 1000)), // 1天前
            iconSrc: bellIcon,
            type: 'achievement'
          }
        ];

        // 合併並按時間排序
        const allNotifications = [...learningNotifications, ...sampleNotifications]
          .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

        setNotifications(allNotifications);
      } catch (error) {
        console.error('載入通知失敗:', error);
        setNotifications([]);
      } finally {
        setLoading(false);
      }
    };

    loadNotifications();
  }, []);

  
  const handleClear = () => {
    setNotifications([]);
  };

  const handleMarkAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, unreadDotSrc: undefined }
          : notification
      )
    );
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
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-primary)' }}>
            載入通知中...
          </div>
        ) : notifications.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-primary)' }}>
            暫無通知
          </div>
        ) : (
          <div className="notifications-list">
            {notifications.map((item) => (
              <article 
                key={item.id} 
                className="notification-item"
                onClick={() => handleMarkAsRead(item.id)}
                style={{ cursor: 'pointer' }}
              >
                <div className="icon-wrapper">
                  <img src={item.iconSrc} alt="Notification Bell" className="bell-icon" />
                  {item.unreadDotSrc && (
                    <img src={item.unreadDotSrc} alt="Unread Indicator" className="unread-dot" />
                  )}
                </div>
                <div className="notification-content">
                  <p className="notification-text">{item.text}</p>
                  {item.type === 'learning' && item.progress && item.total && (
                    <div className="progress-info">
                      <div className="progress-bar">
                        <div 
                          className="progress-fill" 
                          style={{ 
                            width: `${(item.progress / item.total) * 100}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
                <time className="notification-time">{item.time}</time>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default NotificationPage;

//台語單字卡
import React from 'react';
import { useNavigate } from 'react-router-dom'; // 1. 引入 useNavigate
import '../style/ThemeSelectionPage.css'; 
import backIcon from '../assets/Back.svg';
import favoriteIcon from '../assets/收藏.svg';

interface ThemeSelectionPageProps {
  // 我們不再需要來自 props 的 onBack 或 onGoToFavorites
  onSelectTheme?: (theme: string) => void;
}

const ThemeSelectionPage: React.FC<ThemeSelectionPageProps> = ({ onSelectTheme }) => {
  const navigate = useNavigate(); // 2. 取得導航函式

  return (
   <div className="learn-selection-bg">
      <header className="selection-header">
        <div className="header-left">
         <button
            type="button"
            className="back-button"
            aria-label="Back"
            onClick={() => navigate("/Learn")}
          >
            <img src={backIcon} alt="" />
          </button>
          <h1 className="header-title">台語單字卡</h1>
        </div>

        {/* 這個按鈕現在使用 navigate 來切換頁面 */}
        <button
          type="button"
          aria-label="前往收藏集"
          className="favorite-collection-btn"
          onClick={() => navigate('/favorites')} // 3. 導航到 "/favorites" 路由
        >
          <img src={favoriteIcon} alt="收藏集圖示" className="favorite-icon" />
          <span className="favorite-text">收藏集</span>
        </button>
      </header>

      <main className="theme-card-scroll">
        <h2 className="main-title">主題選擇</h2>
        <nav aria-label="主題選擇">
          <div className="theme-card-list">
            <button
              className="theme-card card-yellow"
              onClick={() => onSelectTheme && onSelectTheme('theme1')}
            >
              問候語
            </button>
            <button
              className="theme-card card-orange"
              onClick={() => onSelectTheme && onSelectTheme('theme2')}
            >
              主題二
            </button>
          </div>
        </nav>
      </main>
    </div>
  );
};

export default ThemeSelectionPage;
//故事集
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../style/StoryModePage.css';
//import "../style/GameSelection.css"
import '../style/ThemeSelectionPage.css'; 
import storyImage from '../assets/story.png';
import backIcon from '../assets/back.svg';
import searchIcon from '../assets/search.svg';
import favoriteIcon from '../assets/收藏.png'; // 灰色愛心
import favoriteTabFgActive from '../assets/red.svg'; // 紅色愛心
import storyThumbnail from '../assets/moon.png';

interface StoryModePageProps {
  onBack: () => void;
  onStoryClick: (story: { id: number; title: string }) => void;
}

const stories = [
  { id: 0, title: '月娘花開的暗暝' },
  { id: 1, title: '阿嬤的菜園' },
  { id: 2, title: '海邊的寶藏' },
  { id: 3, title: '貓咪去上學' },
];

const StoryModePage: React.FC<StoryModePageProps> = ({
  onBack,
  onStoryClick,
}) => {
  const [searchText, setSearchText] = useState('');
  const [favorites, setFavorites] = useState<{ [key: number]: boolean }>({});
  const navigate = useNavigate();

  // ✅ 掛載時載入收藏
  useEffect(() => {
    const saved = localStorage.getItem('favorites');
    if (saved) setFavorites(JSON.parse(saved));
  }, []);

  // ✅ 每次收藏更新就寫回 localStorage
  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }, [favorites]);

  const handleFavoriteToggle = (e: React.MouseEvent, storyId: number) => {
    e.stopPropagation();
    setFavorites(prev => ({ ...prev, [storyId]: !prev[storyId] }));
  };

  const visibleStories = stories;

  // 計算收藏數量（右上角徽章）
  const favoriteCount = Object.values(favorites).filter(Boolean).length;

  return (
     <div className="story-selection-bg">
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
          <h1 className="header-title">故事集</h1>
        </div>

        {/* 這個按鈕現在使用 navigate 來切換頁面 */}
        <button
          type="button"
          aria-label="前往收藏集"
          className="favorite-collection-btn"
          onClick={() => navigate('/favorites')} // 3. 導航到 "/favorites" 路由
        >
          <img src={favoriteTabFgActive} alt="收藏集圖示" className="favorite-icon" />
          <span className="favorite-text">收藏集</span>
        </button>
      </header>

      <main className="game-selection-main">
        <div className="search-bar">
          <img src={searchIcon} alt="Search Icon" className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="揣故事"
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
          />
        </div>

        <div className="hero-image-container">
          <img src={storyImage} alt="A bear reading a book in bed" className="hero-image" />
        </div>

      

        <div className="story-grid">
          {visibleStories.map(story => (
            <article
              key={story.id}
              className="story-card"
              onClick={() => onStoryClick({ id: story.id, title: story.title })}
            >
              <img src={storyThumbnail} alt="Story thumbnail" className="story-thumbnail" />
              <div className="card-divider"></div>
              <h2 className="story-title">《{story.title}》</h2>

              <button
                className={`favorite-button ${favorites[story.id] ? 'active' : ''}`}
                onClick={e => handleFavoriteToggle(e, story.id)}
                aria-label={favorites[story.id] ? '移除收藏' : '加入收藏'}
                title={favorites[story.id] ? '再次點擊移除收藏' : '點擊加入收藏'}
              >
                <img
                  src={favorites[story.id] ? favoriteTabFgActive : favoriteIcon}
                  alt={favorites[story.id] ? 'Favorited' : 'Add to favorites'}
                />
              </button>
            </article>
          ))}
        </div>
      </main>
    </div>
  );
};

export default StoryModePage;
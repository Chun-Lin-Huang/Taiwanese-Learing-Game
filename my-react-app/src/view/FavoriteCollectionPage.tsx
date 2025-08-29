//單字卡收藏

import React from 'react';
import { useNavigate } from 'react-router-dom'; 
import backIcon from '../assets/Back.svg';
import '../style/FavoriteCollectionPage.css'; 
import "../style/GameSelection.css";
import '../App.css'; 
const FavoriteCollectionPage: React.FC = () => {
  const navigate = useNavigate(); 

  return (
    <div className="selection-bg">
      <header className="selection-header">
        <button
          type="button"
          className="back-button"
          aria-label="返回"
          onClick={() => window.history.back()}
        >
          <img src={backIcon} alt="返回" />
        </button>
        <h1 className="header-title ">我的收藏集</h1>
      </header>

      <main className="game-selection-main">
        <p>這裡將顯示您收藏的單字卡。</p>
        {/* You can map over your favorite items here */}
      </main>
    </div>
  );
};

export default FavoriteCollectionPage;
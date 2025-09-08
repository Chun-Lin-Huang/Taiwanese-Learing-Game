import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../style/ScoreDisplay.css';

interface ScoreDisplayState {
  score?: number;
  totalQuestions?: number;
}

const ScoreDisplay: React.FC = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const s = (state || {}) as ScoreDisplayState;

  const score = typeof s.score === 'number' ? s.score : 0;
  const totalQuestions = typeof s.totalQuestions === 'number' ? s.totalQuestions : 0;

  const handleRestart = () => {
    // 從 localStorage 重建 theme（你在選單那邊已經有存）
    const title = localStorage.getItem('gameCategoryName') || '主題';
    const img = localStorage.getItem('gameBg') || '';
    const theme = { title, img, path: '' }; // path 用不到可空字串

    navigate('/GameMain', { state: { theme } });
  };

  return (
    <div className="score-display-container">
      <div className="score-card">
        <h2 className="score-title">遊戲結束！</h2>
        <p className="final-score">
          你的分數：<span>{score}</span> / {totalQuestions}
        </p>
        <button className="restart-button" onClick={handleRestart}>
          重新開始
        </button>
      </div>
    </div>
  );
};

export default ScoreDisplay;
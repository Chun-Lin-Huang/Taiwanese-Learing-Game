// 範例： src/components/Flashcard2App.tsx
import React from 'react';
import './FlashcardApp.css';

interface Flashcard2AppProps {
  onBack: () => void;
}

const Flashcard2App: React.FC<Flashcard2AppProps> = ({ onBack }) => {
  return (
    <div>
      <button onClick={onBack}>返回</button>
      <h1>這是收藏集頁面 (Flashcard2App)</h1>
      {/* 這裡可以放你的單字卡列表 */}
    </div>
  );
};

export default Flashcard2App;

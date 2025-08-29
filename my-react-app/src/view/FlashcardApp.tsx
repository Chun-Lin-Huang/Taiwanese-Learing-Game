// 台語單字卡

import React, { useState } from 'react';
import '../style/FlashcardApp.css';
import backIcon from '../assets/back.svg';
import bgImage from '../assets/22600173.png';
import volumeIcon from '../assets/volume up.svg';
// import bearImage from '../assets/bear.png';
import leftArrow from '../assets/left.svg';
import rightArrow from '../assets/right.svg';
import starIcon from '../assets/star.svg';

const flashcards = [
  { id: 0, front: '捷運\ntsia̍-ūn', back: '我逐工攏坐捷運去上班。\nGuá ta̍k-kang lóng tsē tsiat-ūn khì siōng-pan。\n(我每天都搭捷運去上班。)', image: null },
  { id: 1, front: '怪手\nkuài-tshiú', back: '怪手（kuài-tshiú）佇咧挖塗。\n怪手正在挖土。', image: null },
  { id: 2, front: '流籠\nliû-lông', back: '坐流籠上山。\n坐纜車上山。', image: null },
  { id: 3, front: '飛行機\nhui-hîng-ki', back: '我坐飛行機去國外。\n我搭飛機去國外。', image: null },
  { id: 4, front: '直升機\nti̍t-sing-ki', back: '直升機 tī 天頂盤旋。\n直升機在天上盤旋。', image: null },
];

const FlashcardApp: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [flipped, setFlipped] = useState(false);
  const [favorites, setFavorites] = useState<{ [key: number]: boolean }>({});
  const [currentIndex, setCurrentIndex] = useState(0);

  const currentCard = flashcards?.[currentIndex];

  const handleNextCard = () => {
    setCurrentIndex(prevIndex => Math.min(prevIndex + 1, (flashcards?.length ?? 0) - 1));
    setFlipped(false);
  };

  const handlePrevCard = () => {
    setCurrentIndex(prevIndex => Math.max(prevIndex - 1, 0));
    setFlipped(false);
  };

  const handleFavoriteToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentCard) return;

    const currentCardId = currentCard.id;
    setFavorites(prevFavorites => ({
      ...prevFavorites,
      [currentCardId]: !prevFavorites[currentCardId],
    }));
  };

  const isCurrentCardFavorited = currentCard ? favorites[currentCard.id] : false;

  const renderCardText = (text: string | undefined | null) => {
    if (!text) return null;
    
    const lines = text.split('\n');

    return (
      <>
        {lines.map((line, index) => (
          <p
            key={index}
            className={`flashcard-text-line ${index === 2 ? 'flashcard-text-chinese' : ''}`}
          >
            {line}
          </p>
        ))}
      </>
    );
  };

  return (
    <>
      <header id="header" className="site-header">
        <div className="header-content">
          <button className="back-button" aria-label="Go back" onClick={onBack}>
            <img src={backIcon} alt="Back Icon" />
          </button>
          <h1 className="header-title">台語單字卡</h1>
        </div>
      </header>

      <main id="flashcard-app" className="flashcard-section">
        <img className="background-pattern" src={bgImage} alt="background pattern" />
        <div className="flashcard-area">
          <div
            className={`flashcard ${flipped ? 'flipped' : ''}`}
            onClick={() => setFlipped(!flipped)}
          >
            <div className="flashcard-inner">
              <div className="flashcard-front">
                <div className="card-icons">
                  <button className="icon-button" aria-label="Play sound">
                    <img src={volumeIcon} alt="Volume Icon" />
                  </button>
                  <button
                    className="icon-button"
                    aria-label="Add to favorites"
                    onClick={handleFavoriteToggle}
                  >
                    <img
                      src={starIcon}
                      alt="Star Icon"
                      className={`star-icon ${isCurrentCardFavorited ? 'favorited' : ''}`}
                    />
                  </button>
                </div>
                <div className="flashcard-content">
                  {renderCardText(currentCard?.front)}
                </div>
              </div>

              <div className="flashcard-back">
                <div className="card-icons">
                  <button className="icon-button" aria-label="Play sound">
                    <img src={volumeIcon} alt="Volume Icon" />
                  </button>
                  <button
                    className="icon-button"
                    aria-label="Add to favorites"
                    onClick={handleFavoriteToggle}
                  >
                    <img
                      src={starIcon}
                      alt="Star Icon"
                      className={`star-icon ${isCurrentCardFavorited ? 'favorited' : ''}`}
                    />
                  </button>
                </div>
                <div className="flashcard-content">
                  {renderCardText(currentCard?.back)}
                </div>
              </div>
            </div>
          </div>

          <nav className="card-navigation">
            <button
              className="nav-arrow"
              aria-label="Previous card"
              onClick={handlePrevCard}
              disabled={currentIndex === 0}
            >
              <img src={leftArrow} alt="Previous" />
            </button>
            <span className="page-counter">{currentIndex + 1}/{flashcards?.length}</span>
            <button
              className="nav-arrow"
              aria-label="Next card"
              onClick={handleNextCard}
              disabled={currentIndex === (flashcards?.length ?? 0) - 1}
            >
              <img src={rightArrow} alt="Next" />
            </button>
          </nav>
        </div>
        {/* <img src={bearImage} alt="小熊" className="bear-image-bottom-left" /> */}
      </main>
    </>
  );
};

export default FlashcardApp;
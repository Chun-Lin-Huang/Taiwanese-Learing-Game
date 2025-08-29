//故事收藏
 

import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import backIcon from '../assets/Back.svg';
import '../style/FavoriteCollectionPage.css';
import '../style/GameSelection.css';
import '../App.css';

import { stories } from '../data/stories';
import type { Story } from '../data/stories';
import favoriteIcon from '../assets/收藏.png';
import favoriteActive from '../assets/red.svg';
import storyThumbnail from '../assets/moon.png';

type FavoritesMap = { [id: number]: boolean };

const LOVESTORY_FAV_KEY = 'lovestory_favorites';

const LoveStoryPage: React.FC = () => {
  const navigate = useNavigate();
  const [favs, setFavs] = useState<FavoritesMap>({});

  const readFavs = () => {
    try {
      const raw = localStorage.getItem(LOVESTORY_FAV_KEY);
      setFavs(raw ? JSON.parse(raw) : {});
    } catch {
      setFavs({});
    }
  };

  useEffect(() => { readFavs(); }, []);

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === 'visible') readFavs();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, []);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === LOVESTORY_FAV_KEY) readFavs();
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const favoriteStories: Story[] = useMemo(
    () => stories.filter(s => !!favs[s.id]),
    [favs]
  );

  const toggleFavorite = (e: React.MouseEvent, id: number) => {
    e.stopPropagation(); // ← 避免點愛心也觸發導頁
    setFavs(prev => {
      const next = { ...prev, [id]: !prev[id] };
      localStorage.setItem(LOVESTORY_FAV_KEY, JSON.stringify(next));
      return next;
    });
  };

  return (
    <div className="selection-bg">
      <header className="selection-header">
        <button
          type="button"
          className="back-button"
          aria-label="返回"
          onClick={() => navigate(-1)}
        >
          <img src={backIcon} alt="返回" />
        </button>
        <h1 className="header-title">故事收藏集</h1>
      </header>

      <main className="game-selection-main">
        {favoriteStories.length === 0 ? (
          <p>尚未收藏任何故事，回到故事集點愛心即可加入喔！</p>
        ) : (
          <div className="story-grid">
            {favoriteStories.map(story => (
              <article
                key={story.id}
                className="story-card"
                onClick={() => navigate(`/story/${story.id}`)}  // ← 點卡片導到故事內文
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') navigate(`/story/${story.id}`);
                }}
              >
                <img src={storyThumbnail} alt="Story thumbnail" className="story-thumbnail" />
                <div className="card-divider" />
                <h2 className="story-title">《{story.title}》</h2>

                <button
                  className={`favorite-button ${favs[story.id] ? 'active' : ''}`}
                  onClick={(e) => toggleFavorite(e, story.id)}
                  aria-label={favs[story.id] ? '移除收藏' : '加入收藏'}
                  title={favs[story.id] ? '再次點擊移除收藏' : '點擊加入收藏'}
                >
                  <img
                    src={favs[story.id] ? favoriteActive : favoriteIcon}
                    alt={favs[story.id] ? 'Favorited' : 'Add to favorites'}
                  />
                </button>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default LoveStoryPage;
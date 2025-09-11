import { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import '../style/LearningMode.css';
import '../style/Home.css';
import '../style/OverView.css';
import '../App.css';
import backIcon from '../assets/Back.svg';
import volumeIcon from '../assets/volume up.svg';

import { api } from '../enum/api';
import { asyncGet } from '../utils/fetch';

// 圖片總覽資料型別
interface OverviewItem {
  _id: string;
  imageFileName: string;
  imageSize: number;
  imageType: string;
  imageUrl: string;
  vocId: string;
  audioId?: string;
  audioUrl?: string;
  han: string;
  tl: string;
  ch: string;
}

export default function VocabularyOverview() {
  const navigate = useNavigate();
  const { categoryId } = useParams<{ categoryId: string }>();
  const location = useLocation();
  
  const [items, setItems] = useState<OverviewItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<OverviewItem | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // 從 URL 參數或 location state 取得分類資訊
  const categoryName = (location.state as any)?.categoryName || '單字總覽區';

  // 載入圖片總覽資料
  useEffect(() => {
    if (!categoryId) {
      setError('缺少分類ID');
      return;
    }

    const loadOverview = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await asyncGet(`${api.vocabularyPicturesByCategory}/${categoryId}`);
        
        if (response?.code === 200 && response?.body) {
          setItems(response.body);
        } else {
          setError(response?.message || '載入失敗');
        }
      } catch (err: any) {
        setError(err?.message || '載入失敗');
      } finally {
        setLoading(false);
      }
    };

    loadOverview();
  }, [categoryId]);

  // 播放音檔
  const playAudio = async (item: OverviewItem) => {
    if (!item.audioUrl) return;
    
    try {
      setIsPlaying(true);
      
      // 停止當前播放的音檔
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      
      const audio = new Audio(item.audioUrl);
      audioRef.current = audio;
      
      audio.onended = () => setIsPlaying(false);
      audio.onerror = () => setIsPlaying(false);
      
      await audio.play();
    } catch (error) {
      console.error('音檔播放失敗:', error);
      setIsPlaying(false);
    }
  };

  // 點擊圖片處理
  const handleImageClick = (item: OverviewItem) => {
    setSelectedImage(item);
    // 自動播放音檔
    playAudio(item);
  };

  // 關閉 Modal
  const handleCloseModal = () => {
    setSelectedImage(null);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsPlaying(false);
  };

  // 進入單字卡學習
  const handleGoToFlashcard = (item: OverviewItem) => {
    // 使用 query 參數傳遞 categoryId 和具體的單字卡ID
    const params = new URLSearchParams({
      categoryId: categoryId || '',
      title: categoryName,
      cardId: item.vocId, // 傳遞具體的單字卡ID
      index: '0' // 從該單字卡開始
    });
    navigate(`/FlashcardApp?${params.toString()}`);
  };

  // 返回主題選擇
  const handleBack = () => {
    navigate('/ThemeSelection');
  };

  return (
    <div className="vocabulary-overview-page">
      <header className="selection-header">
        <button
          type="button"
          className="back-button"
          aria-label="返回"
          onClick={handleBack}
        >
          <img src={backIcon} alt="返回" />
        </button>
        <h1 className="header-title">{categoryName}</h1>
      </header>

      <main className="learn-selection-main">
        {loading && (
          <div className="loading-container">
            <p>載入中...</p>
          </div>
        )}

        {error && (
          <div className="error-container">
            <p style={{ color: '#b00' }}>{error}</p>
            <button onClick={() => window.location.reload()}>重新載入</button>
          </div>
        )}

        {!loading && !error && items.length === 0 && (
          <div className="empty-container">
            <p>此主題暫無圖片資料</p>
          </div>
        )}

        {!loading && !error && items.length > 0 && (
          <div className="overview-grid">
            {items.map((item) => (
              <div
                key={item._id}
                className="overview-card"
                onClick={() => handleImageClick(item)}
              >
                <img
                  src={item.imageUrl}
                  alt={item.han || item.imageFileName}
                  className="overview-image"
                  onError={(e) => {
                    const img = e.currentTarget as HTMLImageElement;
                    img.src = '/placeholder-image.png'; // 備用圖片
                  }}
                />
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modal 顯示 */}
      {selectedImage && (
        <div className="image-modal">
          <div className="image-modal-content">
            {/* 左上角 X */}
            <button
              className="modal-close-btn"
              onClick={handleCloseModal}
            >
              ✕
            </button>

            {/* 右上角 單字卡 */}
            <button
              className="modal-flashcard-btn"
              onClick={() => handleGoToFlashcard(selectedImage)}
            >
              單字卡
            </button>

            {/* 音檔播放按鈕 */}
            {selectedImage.audioUrl && (
              <button
                className="modal-audio-btn"
                onClick={() => playAudio(selectedImage)}
                disabled={isPlaying}
                title="播放發音"
              >
                <img src={volumeIcon} alt="播放" />
                {isPlaying ? '播放中...' : '播放發音'}
              </button>
            )}

            {/* 放大的圖片 */}
            <img 
              src={selectedImage.imageUrl} 
              alt={selectedImage.han || selectedImage.imageFileName}
              onError={(e) => {
                const img = e.currentTarget as HTMLImageElement;
                img.src = '/placeholder-image.png';
              }}
            />

            {/* 單字資訊 */}
            <div className="modal-word-info">
              <h3>{selectedImage.han}</h3>
              <p className="taiwanese-romanization">{selectedImage.tl}</p>
              <p className="chinese-meaning">{selectedImage.ch}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

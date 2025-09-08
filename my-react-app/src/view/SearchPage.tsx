import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../style/SearchPage.css";
import "../App.css";
import Back from "../assets/back.svg";
import InputBox from "../assets/InputBox.png";
import SearchIcon from "../assets/Search.svg";
import VolumeIcon from "../assets/Volume.png";
import { moedictService, type SearchResult } from "../services/MoedictService";

const SearchPage: React.FC = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!query.trim()) {
      setError("請輸入要查詢的詞彙");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const searchResult = await moedictService.searchForDictionary(query.trim());
      if (searchResult) {
        setResult(searchResult);
      } else {
        setError("查無此詞彙，請嘗試其他詞彙");
      }
    } catch (err) {
      console.error('搜尋失敗:', err);
      setError("搜尋失敗，請稍後再試");
    } finally {
      setLoading(false);
    }
  };

  const playAudio = async (_src: string | undefined, text?: string) => {
    // 使用瀏覽器原生語音合成
    if (text && 'speechSynthesis' in window) {
      try {
        // 停止當前播放
        speechSynthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'zh-TW';
        utterance.rate = 0.7; // 稍微慢一點，更清楚
        utterance.pitch = 1;
        utterance.volume = 1;
        
        // 等待語音載入完成
        const voices = speechSynthesis.getVoices();
        if (voices.length === 0) {
          // 如果語音還沒載入，等待一下
          await new Promise(resolve => {
            speechSynthesis.onvoiceschanged = resolve;
            setTimeout(resolve, 1000); // 最多等待1秒
          });
        }
        
        // 重新獲取語音列表
        const updatedVoices = speechSynthesis.getVoices();
        const chineseVoice = updatedVoices.find(voice => 
          voice.lang.includes('zh') || voice.lang.includes('TW') || voice.lang.includes('CN')
        );
        
        if (chineseVoice) {
          utterance.voice = chineseVoice;
          console.log('使用語音:', chineseVoice.name, chineseVoice.lang);
        } else {
          console.log('未找到中文語音，使用預設語音');
        }
        
        // 添加事件監聽器
        utterance.onstart = () => console.log('開始播放語音');
        utterance.onend = () => console.log('語音播放結束');
        utterance.onerror = (event) => console.error('語音播放錯誤:', event.error);
        
        speechSynthesis.speak(utterance);
        return;
      } catch (error) {
        console.error('語音合成失敗:', error);
      }
    }
    
    // 如果語音合成不可用，顯示提示
    if (!('speechSynthesis' in window)) {
      alert('您的瀏覽器不支援語音合成功能，請使用 Chrome 或 Edge 瀏覽器');
    }
  };

  return (
    <div className="page-bg">
      {/* ===== Header ===== */}
      <header className="game-header">
        <button
          className="back-button"
          onClick={() => navigate(-1)}
          aria-label="返回上一頁"
        >
          <img src={Back} alt="返回" />
        </button>
        <h1 className="header-title">台語辭典</h1>
      </header>

      {/* ===== Main Content ===== */}
      <main className="dictionary-container">
        {/* ===== 搜尋區 ===== */}
        <section id="search" className="search-section">
          <form
            className="search-form"
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch();
            }}
          >
            <div className="search-bar-container">
              <img
                className="search-bar-bg"
                src={InputBox}
                alt="Search bar background"
              />
              <img
                className="search-icon"
                src={SearchIcon}
                alt="Search icon"
              />
              <input
                type="text"
                className="search-input"
                placeholder="請輸入要搜尋的辭典文字 ..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <button 
                type="submit" 
                className="search-button"
                disabled={loading}
              >
                {loading ? "查詢中..." : "查詢"}
              </button>
            </div>
          </form>
        </section>

        {/* ===== 查詢結果區 ===== */}
        <section className="results-section">
          {loading ? (
            <div className="results-body">
              <p className="no-results-message">查詢中，請稍候...</p>
            </div>
          ) : error ? (
            <div className="results-body">
              <p className="no-results-message" style={{ color: '#ff6b6b' }}>
                {error}
              </p>
            </div>
          ) : result ? (
            <div className="results-container">
              <div className="result-column">
                <h2 className="result-header">詞目</h2>
                <div className="underline" style={{ width: 166 }} />
                <p className="result-content">{result.word}</p>
              </div>
              <div className="result-column">
                <h2 className="result-header">音讀</h2>
                <div className="underline" style={{ width: 166 }} />
                <div className="result-content pronunciation">
                  <span>{result.pronunciation}</span>
                  <button
                    className="volume-button"
                    aria-label="Play pronunciation"
                    onClick={() => playAudio(result.audioSrc, result.pronunciation)}
                  >
                    <img
                      src={VolumeIcon}
                      alt="Volume Icon"
                    />
                  </button>
                </div>
              </div>
              <div className="result-column result-column-definition">
                <h2 className="result-header">釋義</h2>
                <div className="underline" style={{ width: 692 }} />
                <p className="result-content">{result.definition}</p>
              </div>
              
              {/* 例句顯示 */}
              {result.examples && result.examples.length > 0 && (
                <div className="result-column" style={{ gridColumn: '1 / -1', marginTop: '20px' }}>
                  <h2 className="result-header">例句</h2>
                  <div className="underline" style={{ width: '100%' }} />
                  <div className="result-content">
                    {result.examples.map((example, index) => (
                      <p key={index} style={{ marginBottom: '8px', lineHeight: '1.6' }}>
                        {example}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="results-body">
              <p className="no-results-message">請輸入要查詢的詞彙</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default SearchPage;
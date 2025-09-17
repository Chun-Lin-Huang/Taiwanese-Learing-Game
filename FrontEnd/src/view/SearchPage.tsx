import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../style/SearchPage.css";
import "../App.css";
import Back from "../assets/Back.svg";
import InputBox from "../assets/InputBox.png";
import SearchIcon from "../assets/search.svg";
import VolumeIcon from "../assets/Volume.png";
import { moedictService, type SearchResult, audioService } from "../services/MoedictService";

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
    if (!text) {
      console.warn('沒有文字可以播放');
      return;
    }

    try {
      // 使用台語語音服務播放音讀
      const success = await audioService.playTaiwaneseAudio(text);
      
      if (!success) {
        console.warn('台語語音播放失敗，請檢查語音服務');
        alert('語音播放失敗，請檢查語音服務是否正常運行');
      }
    } catch (error) {
      console.error('播放台語語音時發生錯誤:', error);
      alert('語音播放失敗，請稍後再試');
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
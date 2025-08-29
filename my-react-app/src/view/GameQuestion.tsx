// 題目頁（用 gameId 取 10 題 → 作答 → 計分）
import { useRef, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../style/GameQuestion.css";
import "../Main.css";
import "../App.css";

import BackIcon from "../assets/Back.svg";
import SpeakerIcon from "../assets/播放鍵.svg";
import CheckIcon from "../assets/正確.png";
import WrongIcon from "../assets/錯誤.png";

import CorrectSound from "../assets/正確音效.wav";
import WrongSound from "../assets/錯誤音效.wav";
import GameOverSound from "../assets/查看分數音效2.wav";
import ButtonClickSound from "../assets/遊戲開始介面音效.wav";

import { api } from "../enum/api"; // 你的 enum/api

type GameTheme = {
  title: string;
  img: string;
  path: string;
};

type Question = {
  _id: string;
  text: string;
  options: string[];
  correctAnswer: string;
  gameId: string;
};

type GameQuestionsResponse =
  | {
      code: number;
      message: string;
      body?: Question[];
    }
  | any;

export default function GameQuestion() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const theme: GameTheme | undefined = state?.theme;

  // 音效（放在最上面，避免 hooks 順序問題）
  const correctAudio = useRef(new Audio(CorrectSound));
  const wrongAudio = useRef(new Audio(WrongSound));
  const gameOverAudio = useRef(new Audio(GameOverSound));
  const buttonClickAudio = useRef(new Audio(ButtonClickSound));
  const playButtonClickSound = () => buttonClickAudio.current.play();

  // === 題目語音相關 ===
  const audioEl = useRef<HTMLAudioElement | null>(null);
  const [audioLoading, setAudioLoading] = useState(false);
  const audioCache = useRef<Map<string, string>>(new Map());

  // 題目資料
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // 作答狀態
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [nextVisible, setNextVisible] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  // 無主題時導回
  useEffect(() => {
    if (!theme) {
      navigate("/GameSelection2", { replace: true });
    }
  }, [theme, navigate]);

  // 讀取題目（使用 gameId + count=10）
  useEffect(() => {
    const run = async () => {
      try {
        const gameId = localStorage.getItem("gameId");
        if (!gameId) {
          throw new Error("找不到遊戲 ID，請回主題頁重新選擇。");
        }
        const res = await fetch(`${api.gameQuestionsByGame}/${gameId}?count=10`);
        const json: GameQuestionsResponse = await res.json();
        if (!res.ok || !json.body || !Array.isArray(json.body)) {
          throw new Error(json?.message || "取得題目失敗");
        }
        setQuestions(json.body);
        setCurrentIndex(0);
      } catch (err: any) {
        console.error(err);
        setLoadError(err?.message || "載入題目失敗");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  // === 換題時停止上一段語音 ===
  useEffect(() => {
    if (audioEl.current) {
      audioEl.current.pause();
      audioEl.current.currentTime = 0;
    }
  }, [currentIndex]);

  // 點語音
  const handleSpeakerClick = async () => {
    const q = questions[currentIndex];
    if (!q) return;

    try {
      setAudioLoading(true);

      let url = audioCache.current.get(q._id);
      if (!url) {
        const res = await fetch(`${api.audioByQuestion}/${encodeURIComponent(q._id)}`);
        const data = await res.json();
        const body = data?.body;
        const candidateUrl =
          (body && typeof body === "object" && !Array.isArray(body) && (body as any).url) ||
          (Array.isArray(body) && body[0]?.url) ||
          null;

        if (!res.ok || !candidateUrl) {
          console.warn("Audio API response:", data);
          alert("這題暫時沒有語音檔可以播放。");
          return;
        }

        url = candidateUrl as string;
        audioCache.current.set(q._id, url);
      }

      if (audioEl.current) {
        audioEl.current.pause();
        audioEl.current.currentTime = 0;
      }

      audioEl.current = new Audio(url);
      await audioEl.current.play();
    } catch (e) {
      console.error(e);
      alert("音檔播放失敗，請稍後再試");
    } finally {
      setAudioLoading(false);
    }
  };

  // 點選答案
  const handleOptionClick = (option: string) => {
    if (showResult || !questions[currentIndex]) return;

    if (audioEl.current) {
      audioEl.current.pause();
      audioEl.current.currentTime = 0;
    }

    setSelected(option);
    const correct = option === questions[currentIndex].correctAnswer;
    setIsCorrect(correct);
    setShowResult(true);

    if (correct) {
      setScore((s) => s + 1);
      correctAudio.current.play();

      setTimeout(() => {
        if (currentIndex < questions.length - 1) {
          setCurrentIndex((i) => i + 1);
          setSelected(null);
          setShowResult(false);
          setIsCorrect(false);
        } else {
          gameOverAudio.current.play();
          setFinished(true);
          // 🚀 改成導頁
          navigate("/ScoreDisplay", {
            state: { score: score + 1, totalQuestions: questions.length },
          });
        }
      }, 2000);
    } else {
      wrongAudio.current.play();
      setNextVisible(true);
    }
  };

  // 下一題（只在答錯時出現）
  const handleNextQuestion = () => {
    playButtonClickSound();
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((i) => i + 1);
      setSelected(null);
      setShowResult(false);
      setIsCorrect(false);
      setNextVisible(false);
    } else {
      gameOverAudio.current.play();
      setFinished(true);
      // 🚀 改成導頁
      navigate("/ScoreDisplay", {
        state: { score, totalQuestions: questions.length },
      });
    }
  };

  // 重新開始
  const handleRestart = () => {
    setLoading(true);
    setLoadError(null);
    setQuestions([]);
    setCurrentIndex(0);
    setSelected(null);
    setShowResult(false);
    setIsCorrect(false);
    setNextVisible(false);
    setScore(0);
    setFinished(false);

    const gameId = localStorage.getItem("gameId");
    if (!gameId) {
      navigate("/GameSelection2");
      return;
    }
    (async () => {
      try {
        const res = await fetch(`${api.gameQuestionsByGame}/${gameId}?count=10`);
        const json: GameQuestionsResponse = await res.json();
        if (!res.ok || !json.body || !Array.isArray(json.body)) {
          throw new Error(json?.message || "取得題目失敗");
        }
        setQuestions(json.body);
      } catch (err: any) {
        console.error(err);
        setLoadError(err?.message || "載入題目失敗");
      } finally {
        setLoading(false);
      }
    })();
  };

  // ⚠️ 移除了原本的 if(finished) return <ScoreDisplay .../>

  // 載入 / 錯誤畫面
  if (loading) {
    return (
      <div className="selection-bg">
        <header className="selection-header">
          <button type="button" className="back-button" aria-label="Back" onClick={() => navigate(-1)}>
            <img src={BackIcon} alt="返回" />
          </button>
        </header>
        <main className="game-question-main">
          <p style={{ textAlign: "center" }}>題目載入中...</p>
        </main>
      </div>
    );
  }

  if (loadError || questions.length === 0) {
    return (
      <div className="selection-bg">
        <header className="selection-header">
          <button type="button" className="back-button" aria-label="Back" onClick={() => navigate(-1)}>
            <img src={BackIcon} alt="返回" />
          </button>
        </header>
        <main className="game-question-main">
          <p style={{ textAlign: "center", marginBottom: 16 }}>
            {loadError || "這個主題目前沒有題目！"}
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
            <button className="next-question-button" onClick={handleRestart}>重新載入</button>
            <button className="next-question-button" onClick={() => navigate("/GameSelection2")}>返回主題選擇</button>
          </div>
        </main>
      </div>
    );
  }

  const q = questions[currentIndex];

  return (
    <div className="selection-bg ">
      <header className="selection-header ">
        <button type="button" className="back-button" aria-label="Back" onClick={() => navigate(-1)}>
          <img src={BackIcon} alt="返回" />
        </button>
        <h1 className="car-header-title">{theme ? theme.title.replace(/\n/g, "") : ""}</h1>
      </header>

      <main className="game-question-main">
        {/* 題號 */}
        <div className="question-number-container">
          <span className="question-number-label">第</span>
          <span className="current-question-num">{currentIndex + 1}</span>
          <span className="question-number-label">/</span>
          <span className="total-questions-num">{questions.length}</span>
          <span className="question-number-label">題</span>
        </div>

        {/* 播放鍵 */}
        <div className="speaker-button-container">
          <button
            className="speaker-button"
            onClick={handleSpeakerClick}
            disabled={audioLoading}
            aria-busy={audioLoading}
            title={audioLoading ? "載入音檔中…" : "播放題目語音"}
          >
            <img src={SpeakerIcon} alt="播放語音" />
          </button>
        </div>

        {/* 題目文字 */}
        <div className="question-text-container">
          <p className="question-text">{q.text}</p>
        </div>

        {/* 選項 */}
        <div className="options-grid">
          {q.options.map((option, index) => {
            const isThisCorrect = option === q.correctAnswer;
            const isThisSelected = selected === option;

            const buttonClassName = `option-button ${
              showResult ? (isThisCorrect ? "correct-answer" : isThisSelected ? "incorrect-answer" : "") : ""
            }`;

            return (
              <button
                key={index}
                className={buttonClassName}
                onClick={() => handleOptionClick(option)}
                disabled={showResult}
              >
                {option}
                {showResult && (
                  <>
                    {isThisCorrect && <img src={CheckIcon} alt="正確" className="correct-check-icon" />}
                    {isThisSelected && !isCorrect && <img src={WrongIcon} alt="錯誤" className="incorrect-wrong-icon" />}
                  </>
                )}
              </button>
            );
          })}
        </div>

        {/* 下一題（僅答錯時顯示） */}
        {nextVisible && (
          <button className="next-question-button" onClick={handleNextQuestion}>
            {currentIndex < questions.length - 1 ? "下一題" : "查看結果"}
          </button>
        )}
      </main>
    </div>
  );
}
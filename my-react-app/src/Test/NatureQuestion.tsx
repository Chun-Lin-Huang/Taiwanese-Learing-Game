import { useRef, useState, useEffect } from "react";
import "../style/GameQuestion.css";
import BackIcon from "../assets/Back.svg";
import SpeakerIcon from "../assets/播放鍵.svg";
import CheckIcon from "../assets/正確.png"; 
import WrongIcon from "../assets/錯誤.png"; 
import ScoreDisplay from './ScoreDisplay.tsx'; 
// 引入音效檔案
import CorrectSound from "../assets/正確音效.wav";   
import WrongSound from "../assets/錯誤音效.wav";     
import GameOverSound from "../assets/查看分數音效2.wav"; 
import ButtonClickSound from "../assets/遊戲開始介面音效.wav"; 

export default function GameQuestion() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);

  const questions = [
    {
      id: 1,
      text: "我細細粒，白白的，炒飯會愛我。是啥米？",
      options: ["鹽", "糖", "胡椒粉", "麵粉"],
      correctAnswer: "鹽",
    },
    {
      id: 2,
      text: "我有很多兄弟姐妹，顏色鮮豔，常常被排成一排。是啥米？",
      options: ["積木", "彩虹", "鉛筆", "樂高"],
      correctAnswer: "鉛筆",
    },
    {
      id: 3,
      text: "什麼東西有頭有尾，卻沒有身體？",
      options: ["硬幣", "蛇", "繩子", "魚"],
      correctAnswer: "硬幣",
    },
    // ... 更多題目
  ];

  const currentQuestion = questions[currentQuestionIndex];

  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false); // 判斷用戶選擇的選項是否正確
  const [nextButtonVisible, setNextButtonVisible] = useState(false); // 控制「下一題」按鈕的顯示

  // 創建 Audio 對象的實例，這樣它們可以被重複播放
  const correctAudio = useRef(new Audio(CorrectSound));
  const wrongAudio = useRef(new Audio(WrongSound));
  const gameOverAudio = useRef(new Audio(GameOverSound));
  const buttonClickAudio = useRef(new Audio(ButtonClickSound)); // <--- 創建按鈕點擊音效實例

  const handleSpeakerClick = () => {
    alert("播放題目語音！");
  };

  const handleOptionClick = (option: string) => {
    if (showResult) return; // 如果已經顯示結果，則不允許再次點擊

    setSelectedOption(option);
    const correct = option === currentQuestion.correctAnswer;
    setIsCorrect(correct); // 更新用戶選擇是否正確的狀態
    setShowResult(true); // 顯示結果 (按鈕變色，Icon 出現)

    if (correct) {
      setScore(prevScore => prevScore + 1); // 答對了就加分
      correctAudio.current.play(); // 播放答對音效

      // 答對時，2 秒後自動跳到下一題
      setTimeout(() => {
        if (currentQuestionIndex < questions.length - 1) {
          setCurrentQuestionIndex(prevIndex => prevIndex + 1); // 跳到下一題
          // 重置狀態，為下一題做準備
          setSelectedOption(null);
          setShowResult(false);
          setIsCorrect(false);
        } else {
          // 所有題目都答完畢，直接進入分數畫面
          gameOverAudio.current.play(); // 播放遊戲結束音效
          setQuizCompleted(true);
        }
      }, 2000); // 2000 毫秒 = 2 秒
    } else {
      // 答錯時，播放答錯音效，並顯示「下一題」按鈕，不自動跳轉
      wrongAudio.current.play(); // 播放答錯音效
      setNextButtonVisible(true);
    }
  };

  const handleNextQuestion = () => {
    buttonClickAudio.current.play(); // <--- 在點擊「下一題」按鈕時播放音效

    // 檢查是否還有下一題
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prevIndex => prevIndex + 1); // 跳到下一題
      // 重置狀態，為下一題做準備
      setSelectedOption(null);
      setShowResult(false);
      setIsCorrect(false);
      setNextButtonVisible(false); // 隱藏「下一題」按鈕
    } else {
      // 所有題目都答完畢，進入分數畫面
      gameOverAudio.current.play(); // 播放遊戲結束音效 (如果不是已經在答對自動跳轉時播放過了的話)
      setQuizCompleted(true);
    }
  };

  // 處理重新開始遊戲
  const handleRestartGame = () => {
    // 這裡你可能也想加音效，例如重新開始的音效
    setCurrentQuestionIndex(0);
    setScore(0);
    setSelectedOption(null);
    setShowResult(false);
    setIsCorrect(false);
    setQuizCompleted(false);
    setNextButtonVisible(false); // 重置時確保按鈕隱藏
  };

  // 如果遊戲已經完成，則渲染分數畫面
  if (quizCompleted) {
    return (
      <ScoreDisplay
        score={score}
        totalQuestions={questions.length}
        onRestartGame={handleRestartGame}
      />
    );
  }

  return (
    <div className="game-GameQuestion-bg">
      <header className="game-header">
        <button
          type="button"
          className="back-button"
          aria-label="Back"
          onClick={() => window.history.back()}
        >
          <img src={BackIcon} alt="返回" />
        </button>
        <h1 className="header-title">森林俱樂部</h1>
      </header>

      <main className="game-question-main">
        {/* 題號區塊 */}
        <div className="question-number-container">
          <span className="question-number-label">第</span>
          <span className="current-question-num">{currentQuestionIndex + 1}</span>
          <span className="question-number-label">/</span>
          <span className="total-questions-num">{questions.length}</span>
          <span className="question-number-label">題</span>
        </div>

        {/* 播放鍵的獨立容器 */}
        <div className="speaker-button-container">
          <button className="speaker-button" onClick={handleSpeakerClick}>
            <img src={SpeakerIcon} alt="播放語音" />
          </button>
        </div>

        {/* 題目文字的獨立容器 */}
        <div className="question-text-container">
          <p className="question-text">{currentQuestion.text}</p>
        </div>

        {/* 選項區塊 */}
        <div className="options-grid">
          {currentQuestion.options.map((option, index) => {
            const isThisOptionCorrect = option === currentQuestion.correctAnswer;
            const isThisOptionSelected = selectedOption === option;

            // 動態生成按鈕的 class name，保留顏色變換
            const buttonClassName = `option-button ${
              showResult
                ? isThisOptionCorrect // 如果是正確答案
                  ? 'correct-answer'
                  : isThisOptionSelected // 如果不是正確答案，但被選中了 (即用戶選錯的答案)
                    ? 'incorrect-answer'
                    : '' // 其他未選中的選項，保持基礎樣式
                : '' // 還沒顯示結果時，只使用基礎樣式
            }`;

            return (
              <button
                key={index}
                className={buttonClassName}
                onClick={() => handleOptionClick(option)}
                disabled={showResult} 
              >
                {option}
                {/* Icon 顯示邏輯 */}
                {showResult && ( // 只有在顯示結果時才判斷 Icon
                  <>
                    {/* 顯示正確答案的對勾 (無論是否被選中) */}
                    {isThisOptionCorrect && (
                      <img src={CheckIcon} alt="正確" className="correct-check-icon" />
                    )}
                    {/* 顯示用戶選擇的錯誤答案的叉叉 */}
                    {isThisOptionSelected && !isCorrect && (
                      <img src={WrongIcon} alt="錯誤" className="incorrect-wrong-icon" />
                    )}
                  </>
                )}
              </button>
            );
          })}
        </div>

        {/* 「下一題」按鈕 (只在答錯時顯示，或在最後一題結束時顯示「查看結果」) */}
        {nextButtonVisible && ( // 只有當 nextButtonVisible 為 true 時才顯示
          <button className="next-question-button" onClick={handleNextQuestion}>
            {currentQuestionIndex < questions.length - 1 ? "下一題" : "查看結果"}
          </button>
        )}
      </main>
    </div>
  );
}
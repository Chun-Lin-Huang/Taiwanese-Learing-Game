// GameMain.tsx
import { useState, useRef } from "react"; 
import { useNavigate } from "react-router-dom";
import CardImg from "../assets/誰是交通王.png";
import ButtonClickSound from "../assets/遊戲開始介面音效.wav"; 
import "../style/Game.css";
import "../Main.css";
export default function Game() {
  const navigate = useNavigate();
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  // 創建 Audio 對象的實例
  const buttonClickAudio = useRef(new Audio(ButtonClickSound));

  // 播放音效的函數
  const playButtonClickSound = () => {
    buttonClickAudio.current.play();
  };

  return (
    <div className="game-selection-bg">
      <div
        className="main-menu full-screen"
        style={{ backgroundImage: `url(${CardImg})`, backgroundSize: "cover" }}
      >
        <div className="main-menu-overlay">
          <h1 className="main-menu-title">誰是交通王</h1>
          <div className="menu-buttons">
            <button
              className="start-button"
              onClick={() => {
                playButtonClickSound(); // <--- 播放音效
                navigate("/CarQuestion");
              }}
            >
              開始遊戲
            </button>

            <button
              className="exit-button"
              onClick={() => {
                playButtonClickSound(); // <--- 播放音效
                setShowExitConfirm(true);
              }}
            >
              退出遊戲
            </button>
          </div>

          {showExitConfirm && (
            <div className="confirm-dialog">
              <div className="confirm-box">
                <p>確定要離開遊戲嗎？</p>
                <div className="confirm-actions">
                  <button
                    onClick={() => {
                      playButtonClickSound(); // <--- 播放音效
                      navigate("/Game");
                    }}
                  >
                    是
                  </button>
                  <button
                    onClick={() => {
                      playButtonClickSound(); // <--- 播放音效
                      setShowExitConfirm(false);
                    }}
                  >
                    否
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
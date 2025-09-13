import React from "react";
import { useNavigate } from "react-router-dom";

// 資源
import backIcon from "../assets/Back.svg";
import bgImage from "../assets/game-bg.png";
import roomIcon from "../assets/room.png";
import loginIcon from "../assets/login.png";

import "../style/GameMenu.css";

const GameMenu: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div 
      className="selection-bg game-menu-bg"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <main className="game-menu-main">
        <section
          className="game-menu-stage"
          role="img"
          aria-label="超級大富翁首頁畫面"
        >
          {/* 返回箭頭 */}
          <button
            type="button"
            className="gm-back"
            aria-label="返回"
            onClick={() => navigate("/Learn")}
          >
            <img src={backIcon} alt="返回" />
          </button>

          {/* 操作按鈕 */}
          <nav className="gm-actions" aria-label="主要操作">
            <button
              className="gm-btn gm-btn-primary"
              onClick={() => navigate("/rooms/create")}
            >
              <img src={roomIcon} alt="創建房間" className="gm-icon" />
              創建房間
            </button>

            <button
              className="gm-btn gm-btn-accent"
              onClick={() => navigate("/rooms/join")}
            >
              <img src={loginIcon} alt="加入房間" className="gm-icon" />
              加入房間
            </button>
          </nav>
        </section>
      </main>
    </div>
  );
};

export default GameMenu;

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import backIcon from "../assets/Back.svg";
import roomIcon from "../assets/room.png";        // 標題左側小屋 icon
import createBg from "../assets/底圖.png";        // 你的底圖
import "../style/CreateRoom.css";

const CreateRoom: React.FC = () => {
  const [players, setPlayers] = useState<number | null>(null);
  const navigate = useNavigate();

  const handleConfirm = () => {
    if (!players) return;
    navigate(`/lobby?players=${players}`);
  };

  return (
    <div 
      className="selection-bg cr-bg"
      style={{ backgroundImage: `url(${createBg})` }}
    >
      <main className="cr-main">
        <section
          className="cr-stage"
          aria-label="建立房間 - 選擇人數"
        >
          {/* 返回 */}
          <button
            type="button"
            className="cr-back"
            aria-label="返回"
            onClick={() => navigate("/Learn")}
          >
            <img src={backIcon} alt="返回" />
          </button>

          {/* 🔶 頂部標題：創建房間 */}
          <div className="cr-title">
            <img className="cr-title-icon" src={roomIcon} alt="" />
            <span>創建房間</span>
          </div>

          {/* 中央卡片：選擇人數 */}
          <div className="cr-card">
            <h2 className="cr-card-title">選擇人數</h2>
            <div className="cr-options">
              {[2, 3, 4].map(n => (
                <button
                  key={n}
                  className={`cr-option ${players === n ? "active" : ""}`}
                  onClick={() => setPlayers(n)}
                  aria-pressed={players === n}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          {/* 主行動：建立房間（#FF9933） */}
          <button
            className="cr-confirm"
            disabled={!players}
            onClick={handleConfirm}
          >
            建立房間
          </button>
        </section>
      </main>
    </div>
  );
};

export default CreateRoom;

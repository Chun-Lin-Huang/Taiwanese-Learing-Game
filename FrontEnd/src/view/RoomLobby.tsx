import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import backIcon from "../assets/Back.svg";
import lobbyBg from "../assets/star.png"; 
import "../style/RoomLobby.css";

const RoomLobby: React.FC = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  // 房號：若有 query 參數就用，否則示範用 1234
  const roomCode = params.get("code") || "1234";
  // 依照上一頁選擇的人數決定幾個座位，沒有的話示範 4 位
  const total = Number(params.get("players") || 4);

  // 玩家名稱狀態
  const [playerNames, setPlayerNames] = useState<string[]>(
    Array.from({ length: total }, (_, i) => `玩家${i + 1}`)
  );

  // 更新玩家名稱
  const updatePlayerName = (index: number, name: string) => {
    const newNames = [...playerNames];
    newNames[index] = name;
    setPlayerNames(newNames);
  };

  // 檢查是否所有玩家都有名稱
  const allPlayersReady = playerNames.every(name => name.trim() !== "");

  // 開始遊戲
  const startGame = () => {
    if (allPlayersReady) {
      // 使用 state 傳遞資料，不在 URL 中顯示
      navigate('/game', {
        state: {
          roomCode: roomCode,
          players: playerNames
        }
      });
    }
  };

  return (
    <div
      className="selection-bg rl-bg"
      style={{ backgroundImage: `url(${lobbyBg})` }}
    >
      <main className="rl-main">
        <section
          className="rl-stage"
          aria-label="房間大廳"
        >
          {/* 返回 */}
          <button
            type="button"
            className="rl-back"
            aria-label="返回"
            onClick={() => window.history.back()}
          >
            <img src={backIcon} alt="返回" />
          </button>

          {/* 標題 + 房號 */}
          <h1 className="rl-title">房間號碼</h1>
          <div className="rl-code">{roomCode}</div>

          {/* 提示文字 */}
          <p className="rl-hint">請輸入所有玩家的名稱，然後開始遊戲！</p>

          {/* 座位列 - 現在包含輸入框 */}
          <div className="rl-seats">
            {playerNames.map((name, i) => (
              <div key={i} className="rl-seat">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => updatePlayerName(i, e.target.value)}
                  placeholder={`玩家${i + 1}`}
                  className="rl-player-input"
                  maxLength={10}
                />
              </div>
            ))}
          </div>

          {/* 主行動：開始遊戲 */}
          <button
            className={`rl-start ${!allPlayersReady ? 'rl-start-disabled' : ''}`}
            onClick={startGame}
            disabled={!allPlayersReady}
          >
            開始遊戲
          </button>
        </section>
      </main>
    </div>
  );
};

export default RoomLobby;

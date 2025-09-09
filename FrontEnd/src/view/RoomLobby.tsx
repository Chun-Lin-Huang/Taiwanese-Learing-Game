import React, { useMemo } from "react";
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

  // 假資料：第 1 位已就緒，其餘等待中
  const seats = useMemo(
    () => Array.from({ length: total }, (_, i) => (i === 0 ? "玩家1" : "等待中")),
    [total]
  );

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
          <p className="rl-hint">請把房號分享給朋友，讓他們輸入加入！</p>

          {/* 座位列 */}
          <div className="rl-seats">
            {seats.map((label, i) => (
              <div key={i} className="rl-seat">
                {label}
              </div>
            ))}
          </div>

          {/* 主行動：開始遊戲 */}
          <button
            className="rl-start"
            onClick={() => navigate(`/game?code=${roomCode}`)}
          >
            開始遊戲
          </button>
        </section>
      </main>
    </div>
  );
};

export default RoomLobby;

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import backIcon from "../assets/Back.svg";
import roomIcon from "../assets/room.png";        // 標題左側小屋 icon
import createBg from "../assets/底圖.png";        // 你的底圖
import "../style/CreateRoom.css";
import { api } from "../enum/api";
import { asyncPost } from "../utils/fetch";

const CreateRoom: React.FC = () => {
  const [players, setPlayers] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleConfirm = async () => {
    if (!players) return;
    
    setLoading(true);
    try {
      // 創建房間
      const response = await asyncPost(api.roomCreate, {
        gameName: `大富翁遊戲 - ${players}人局`,
        maxPlayers: players,
        boardId: "default" // 使用預設地圖
      });

      if (response.code === 201 && response.body?.roomCode) {
        toast.success(`房間創建成功！房號：${response.body.roomCode}`, {
          position: "top-center",
          autoClose: 3000,
        });
        
        // 跳轉到大廳，帶上房間代碼
        navigate(`/lobby?code=${response.body.roomCode}&players=${players}`);
      } else {
        throw new Error(response.message || "創建房間失敗");
      }
    } catch (error: any) {
      console.error('創建房間失敗:', error);
      toast.error(`創建房間失敗: ${error.message}`, {
        position: "top-center",
        autoClose: 3000,
      });
    } finally {
      setLoading(false);
    }
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
            disabled={!players || loading}
            onClick={handleConfirm}
          >
            {loading ? "創建中..." : "建立房間"}
          </button>
        </section>
      </main>
    </div>
  );
};

export default CreateRoom;

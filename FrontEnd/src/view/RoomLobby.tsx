import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import backIcon from "../assets/Back.svg";
import lobbyBg from "../assets/star.png"; 
import "../style/RoomLobby.css";
import { api } from "../enum/api";
import { asyncGet, asyncPost, asyncPut } from "../utils/fetch";

interface UserData {
  _id: string;
  name: string;
  userName: string;
}

interface RoomData {
  roomCode: string;
  gameName: string;
  maxPlayers: number;
  currentPlayers: number;
  players: Array<{
    id: number;
    name: string;
    userName?: string;
    isReady: boolean;
  }>;
  status: string;
}

const RoomLobby: React.FC = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  // 房號：從 URL 參數獲取
  const roomCode = params.get("code");
  // 依照上一頁選擇的人數決定幾個座位，沒有的話示範 4 位
  const total = Number(params.get("players") || 4);

  // 房間資料狀態
  const [roomData, setRoomData] = useState<RoomData | null>(null);
  const [loading, setLoading] = useState(false);

  // 玩家名稱狀態
  const [playerNames, setPlayerNames] = useState<string[]>(
    Array.from({ length: total }, (_, i) => `玩家${i + 1}`)
  );

  // 使用者資料狀態
  const [userData, setUserData] = useState<UserData[]>(
    Array.from({ length: total }, () => ({ _id: '', name: '', userName: '' }))
  );

  // 載入狀態
  const [loadingStates, setLoadingStates] = useState<boolean[]>(
    Array.from({ length: total }, () => false)
  );

  // 使用者驗證狀態
  const [userValidationStates, setUserValidationStates] = useState<boolean[]>(
    Array.from({ length: total }, () => false)
  );

  // 載入房間資料
  useEffect(() => {
    if (roomCode) {
      loadRoomData();
    }
  }, [roomCode]);

  const loadRoomData = async () => {
    if (!roomCode) return;
    
    setLoading(true);
    try {
      const response = await asyncGet(`${api.roomGetByCode}/${roomCode}`);
      
      if (response.code === 200 && response.body) {
        setRoomData(response.body);
        
        // 更新玩家資料
        const roomPlayers = response.body.players || [];
        const newPlayerNames = Array.from({ length: total }, (_, i) => {
          const roomPlayer = roomPlayers.find((p: any) => p.id === i + 1);
          return roomPlayer ? roomPlayer.name : `玩家${i + 1}`;
        });
        setPlayerNames(newPlayerNames);

        const newUserData = Array.from({ length: total }, (_, i) => {
          const roomPlayer = roomPlayers.find((p: any) => p.id === i + 1);
          return roomPlayer ? {
            _id: roomPlayer.userName || '',
            name: roomPlayer.name,
            userName: roomPlayer.userName || ''
          } : { _id: '', name: '', userName: '' };
        });
        setUserData(newUserData);

        const newValidationStates = Array.from({ length: total }, (_, i) => {
          const roomPlayer = roomPlayers.find((p: any) => p.id === i + 1);
          return roomPlayer ? roomPlayer.isReady : false;
        });
        setUserValidationStates(newValidationStates);

      } else {
        toast.error("房間不存在或已過期", {
          position: "top-center",
          autoClose: 3000,
        });
        navigate("/SuperMonopoly");
      }
    } catch (error: any) {
      console.error('載入房間資料失敗:', error);
      toast.error("載入房間資料失敗", {
        position: "top-center",
        autoClose: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  // 更新玩家名稱
  const updatePlayerName = (index: number, name: string) => {
    const newNames = [...playerNames];
    newNames[index] = name;
    setPlayerNames(newNames);

    // 清除對應的使用者資料和驗證狀態
    const newUserData = [...userData];
    newUserData[index] = { _id: '', name: '', userName: '' };
    setUserData(newUserData);

    const newValidationStates = [...userValidationStates];
    newValidationStates[index] = false;
    setUserValidationStates(newValidationStates);
  };

  // 查找使用者資料
  const findUser = async (index: number, userName: string) => {
    if (!userName.trim()) return;

    // 設置載入狀態
    const newLoadingStates = [...loadingStates];
    newLoadingStates[index] = true;
    setLoadingStates(newLoadingStates);

    try {
      const result = await asyncGet(`${api.findByUserName}/${encodeURIComponent(userName.trim())}`);

      const newUserData = [...userData];
      const newValidationStates = [...userValidationStates];
      
      if (result.code === 200 && result.body) {
        // 找到使用者，更新資料和顯示名稱
        newUserData[index] = result.body;
        newValidationStates[index] = true;
        const newNames = [...playerNames];
        newNames[index] = result.body.name;
        setPlayerNames(newNames);
        setUserData(newUserData);
        setUserValidationStates(newValidationStates);
        
        // 顯示成功提示
        toast.success(`找到使用者: ${result.body.name}`, {
          position: "top-center",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: false,
          draggable: true,
        });
        
        console.log(`找到使用者: ${result.body.userName}`);
      } else {
        // 找不到使用者，清除驗證狀態
        newUserData[index] = { _id: '', name: '', userName: '' };
        newValidationStates[index] = false;
        setUserData(newUserData);
        setUserValidationStates(newValidationStates);
        
        // 顯示錯誤提示
        toast.error(`❌ 找不到使用者: ${userName}`, {
          position: "top-center",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: false,
          draggable: true,
        });
        
        console.log(`找不到使用者: ${userName}`);
      }
    } catch (error: any) {
      console.error('查找使用者失敗:', error);
      
      // 清除驗證狀態
      const newUserData = [...userData];
      const newValidationStates = [...userValidationStates];
      newUserData[index] = { _id: '', name: '', userName: '' };
      newValidationStates[index] = false;
      setUserData(newUserData);
      setUserValidationStates(newValidationStates);
      
      // 檢查是否為 404 錯誤（使用者不存在）
      if (error?.status === 404 || error?.message?.includes('404')) {
        // 404 錯誤：使用者不存在
        toast.error(`找不到使用者: ${userName}`, {
          position: "top-center",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: false,
          draggable: true,
        });
        console.log(`找不到使用者: ${userName}`);
      } else {
        // 其他錯誤：網路錯誤
        toast.error(`網路錯誤，請稍後再試`, {
          position: "top-center",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: false,
          draggable: true,
        });
        console.log('網路錯誤:', error);
      }
    } finally {
      // 清除載入狀態
      const newLoadingStates = [...loadingStates];
      newLoadingStates[index] = false;
      setLoadingStates(newLoadingStates);
    }
  };

  // 檢查是否所有玩家都有名稱且都通過使用者驗證
  const allPlayersReady = playerNames.every(name => name.trim() !== "");
  const allUsersValidated = userValidationStates.every(validated => validated);
  const canStartGame = allPlayersReady && allUsersValidated;

  // 開始遊戲
  const startGame = async () => {
    if (!canStartGame || !roomCode) return;

    try {
      // 更新房間狀態為進行中
      await asyncPut(`${api.roomUpdateStatus}/${roomCode}/status`, {
        status: 'in_progress'
      });

      // 使用 state 傳遞資料，不在 URL 中顯示
      navigate('/game', {
        state: {
          roomCode: roomCode,
          players: playerNames,
          userData: userData // 傳遞使用者資料
        }
      });
    } catch (error: any) {
      console.error('開始遊戲失敗:', error);
      toast.error("開始遊戲失敗", {
        position: "top-center",
        autoClose: 3000,
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
          <div className="rl-code">{roomCode || "載入中..."}</div>

          {/* 提示文字 */}
          <p className="rl-hint">請輸入使用者名稱並點擊🔍驗證，所有玩家都驗證成功才能開始遊戲！</p>

          {/* 座位列 - 現在包含輸入框 */}
          <div className="rl-seats">
            {playerNames.map((name, i) => (
              <div key={i} className="rl-seat">
                <div className="rl-input-group">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => updatePlayerName(i, e.target.value)}
                    placeholder={`玩家${i + 1}`}
                    className="rl-player-input"
                    maxLength={10}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        findUser(i, name);
                      }
                    }}
                  />
                  <button
                    type="button"
                    className="rl-find-btn"
                    onClick={() => findUser(i, name)}
                    disabled={loadingStates[i]}
                    title="查找使用者"
                  >
                    {loadingStates[i] ? '...' : '🔍'}
                  </button>
                </div>
                {userData[i].userName && (
                  <div className={`rl-user-info ${userValidationStates[i] ? 'rl-user-valid' : 'rl-user-invalid'}`}>
                    {userValidationStates[i] ? (
                      <>使用者: {userData[i].userName}</>
                    ) : (
                      <>找不到使用者: {playerNames[i]}</>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* 主行動：開始遊戲 */}
          <button
            className={`rl-start ${!canStartGame ? 'rl-start-disabled' : ''}`}
            onClick={startGame}
            disabled={!canStartGame}
          >
            開始遊戲
          </button>
        </section>
      </main>
    </div>
  );
};

export default RoomLobby;

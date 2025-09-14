import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../style/ScoreSummary.css';

interface PlayerRecord {
  id: number;
  timestamp: Date;
  location: number;
  locationName: string;
  action: string;
  details?: string;
}

interface GameAction {
  _id?: string;
  actionType: 'dice_roll' | 'move' | 'challenge' | 'bankruptcy' | 'shortcut' | 'victory';
  playerId: number;
  playerName: string;
  description: string;
  details?: any;
  timestamp: Date;
}

interface GameHistory {
  _id?: string;
  gameId: string;
  gameName: string;
  players: Array<{
    id: number;
    name: string;
    userName?: string;
    finalScore?: number;
    finalRound?: number;
  }>;
  actions: GameAction[];
  startTime: Date;
  endTime?: Date;
  winner?: {
    playerId: number;
    playerName: string;
    reason: string;
  };
  gameStatus: 'in_progress' | 'completed' | 'abandoned';
}

interface Player {
  id: number;
  name: string;
  avatar: string;
  avatarImage?: string;
  round: number;
  status: string;
  location: number;
  locationName: string;
  record: string;
  records: PlayerRecord[];
  isCurrentPlayer: boolean;
  score: number;
  diceSum: number;
}

const ScoreSummary: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const players = location.state?.players || [];
  const gameId = location.state?.gameId;
  const _frontendGameHistory = location.state?.gameHistory;
  
  const [dbGameHistory, setDbGameHistory] = useState<GameHistory | null>(null);
  const [loading, setLoading] = useState(false);

  // 從資料庫讀取遊戲歷史
  useEffect(() => {
    const fetchGameHistory = async () => {
      if (!gameId) return;
      
      setLoading(true);
      try {
        const response = await fetch(`http://127.0.0.1:2083/api/v1/game-history/${gameId}`);
        if (response.ok) {
          const result = await response.json();
          if (result.code === 200) {
            setDbGameHistory(result.body);
          }
        } else {
          console.error('讀取遊戲歷史失敗:', await response.text());
        }
      } catch (error) {
        console.error('讀取遊戲歷史時發生錯誤:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGameHistory();
  }, [gameId]);

  // 計算玩家排名
  const getPlayerRanking = () => {
    return [...players].sort((a, b) => {
      // 破產的玩家排在最後
      if (a.status === '破產' && b.status !== '破產') return 1;
      if (b.status === '破產' && a.status !== '破產') return -1;
      
      // 非破產玩家按照骰子點數加總排序（點數越高排名越前面）
      if (a.diceSum !== b.diceSum) {
        return b.diceSum - a.diceSum;
      }
      
      // 如果骰子點數相同，按照成功挑戰數量排序
      const aSuccessCount = a.records.filter((r: PlayerRecord) => r.details?.includes('成功')).length;
      const bSuccessCount = b.records.filter((r: PlayerRecord) => r.details?.includes('成功')).length;
      
      if (aSuccessCount !== bSuccessCount) {
        return bSuccessCount - aSuccessCount;
      }
      
      // 如果成功挑戰數量也相同，按照記錄數量排序
      return b.records.length - a.records.length;
    });
  };

  return (
    <div className="score-summary-overlay">
      <div className="score-summary-content">
        {/* 標題欄 */}
        <div className="summary-header">
          <button 
            className="back-button"
            onClick={() => navigate(-1)}
          >
            ←
          </button>
          <div className="summary-title">
            <span className="title-text">成績總結</span>
            <span className="title-icon">📊</span>
          </div>
        </div>

        {/* 玩家排名 - 頭像和名字在框框外，記錄在下方 */}
        <div className="player-rankings-container">
          {getPlayerRanking().map((player, index) => {
            // 獲取該玩家的挑戰記錄
            const playerActions = dbGameHistory?.actions.filter(action => action.playerId === player.id) || [];
            
            // 統計挑戰成功/失敗次數
            const challengeActions = playerActions.filter(action => action.actionType === 'challenge');
            const successCount = challengeActions.filter(action => 
              action.description.includes('成功') || 
              action.description.includes('挑戰成功') ||
              action.description.includes('答對了')
            ).length;
            const failureCount = challengeActions.filter(action => 
              action.description.includes('失敗') || 
              action.description.includes('挑戰失敗') ||
              action.description.includes('答錯了')
            ).length;
            
            return (
              <div key={player.id} className="player-section">
                {/* 玩家頭像和名字 - 在框框外 */}
                <div className={`player-rank-header ${index === 0 ? 'winner' : ''}`}>
                  <div className="rank-avatar">
                    {player.avatarImage ? (
                      <img 
                        src={player.avatarImage} 
                        alt={player.name}
                        className="avatar-image"
                      />
                    ) : (
                      <span className="avatar-emoji">{player.avatar}</span>
                    )}
                    {index === 0 && <div className="crown">👑</div>}
                  </div>
                  <div className="player-name">{player.name}</div>
                  <div className="rank-position">第{index + 1}名</div>
                  {/* 挑戰統計 */}
                  <div className="challenge-stats">
                    <div className="stat-item success">
                      <span className="stat-label">挑戰成功:</span>
                      <span className="stat-value">{successCount}</span>
                    </div>
                    <div className="stat-item failure">
                      <span className="stat-label">挑戰失敗:</span>
                      <span className="stat-value">{failureCount}</span>
                    </div>
                  </div>
                </div>

                {/* 該玩家的挑戰記錄 - 在框框內，可滑動 */}
                <div className="player-game-record">
                  <div className="record-title">遊戲紀錄</div>
                  <div className="player-actions-list">
                    {playerActions.length > 0 ? (
                      playerActions.map((action, actionIndex) => (
                        <div key={action._id || actionIndex} className={`record-item ${action.actionType}`}>
                          {action.description}
                        </div>
                      ))
                    ) : (
                      <div className="record-item">-準備開始遊戲</div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>


        {/* 結束按鈕 */}
        <div className="summary-footer">
          <button 
            className="end-game-button"
            onClick={() => navigate('/SuperMonopoly')}
          >
            結束
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScoreSummary;
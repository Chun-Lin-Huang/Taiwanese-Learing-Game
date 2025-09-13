import React from 'react';
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

        {/* 玩家排名 */}
        <div className="player-rankings">
          {getPlayerRanking().map((player, index) => (
            <div 
              key={player.id} 
              className={`player-rank ${index === 0 ? 'winner' : ''}`}
            >
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
              <div className="rank-info">
                <div className="player-name">{player.name}</div>
                <div className="rank-position">第{index + 1}名</div>
              </div>
            </div>
          ))}
        </div>

        {/* 遊戲紀錄 */}
        <div className="game-records">
          {players.map((player: Player) => (
            <div key={player.id} className="player-record-panel">
              <div className="record-header">遊戲紀錄</div>
              <div className="record-list">
                {player.records.slice(-3).reverse().map((record: PlayerRecord) => (
                  <div key={record.id} className="record-item">
                    -{record.details}
                  </div>
                ))}
              </div>
            </div>
          ))}
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
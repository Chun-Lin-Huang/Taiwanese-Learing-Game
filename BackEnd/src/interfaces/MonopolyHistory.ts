import { Types } from "mongoose";

export interface GameAction {
  _id?: string;
  actionType: 'dice_roll' | 'move' | 'challenge' | 'bankruptcy' | 'shortcut' | 'victory';
  playerId: number;
  playerName: string;
  description: string;
  details?: any;
  timestamp: Date;
  roomCode?: string;  // 新增：房間代碼
}

export interface MonopolyHistory {
  _id?: string;
  gameId: string;                    // 遊戲唯一識別碼
  gameName: string;                  // 遊戲名稱
  roomCode?: string;                 // 新增：房間代碼
  boardId?: Types.ObjectId;          // 對應的地圖板ID（可選）
  players: Array<{                   // 參與遊戲的玩家
    id: number;
    name: string;
    userName?: string;               // 可選：從資料庫查到的使用者名稱
    finalScore?: number;             // 最終分數
    finalRound?: number;             // 最終回合數
  }>;
  actions: GameAction[];             // 遊戲動作記錄
  startTime: Date;                   // 遊戲開始時間
  endTime?: Date;                    // 遊戲結束時間
  winner?: {                         // 獲勝者資訊
    playerId: number;
    playerName: string;
    reason: string;                  // 獲勝原因（如：經過起點3次）
  };
  gameStatus: 'in_progress' | 'completed' | 'abandoned';  // 遊戲狀態
  totalRounds?: number;              // 總回合數
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Room {
    _id?: string;
    roomCode: string;                    // 房間代碼（6位數字）
    gameName: string;                    // 遊戲名稱
    maxPlayers: number;                  // 最大玩家數
    currentPlayers: number;              // 當前玩家數
    players: Array<{                     // 房間內的玩家
      id: number;
      name: string;
      userName?: string;                 // 可選：從資料庫查到的使用者名稱
      isReady: boolean;                  // 是否準備好
    }>;
    boardId?: string;                    // 地圖板ID（可選）
    status: 'waiting' | 'in_progress' | 'completed' | 'abandoned';  // 房間狀態
    createdAt?: Date;
    updatedAt?: Date;
    expiresAt?: Date;                    // 房間過期時間（可選）
  }
  
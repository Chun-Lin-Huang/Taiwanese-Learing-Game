import { RoomModel } from "../orm/schemas/roomSchemas";
import { Room } from "../interfaces/Room";
import type { resp } from "../utils/resp";

export class RoomService {
  /**
   * 生成6位數字的房間代碼
   */
  private generateRoomCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * 檢查房間代碼是否已存在
   */
  private async isRoomCodeExists(roomCode: string): Promise<boolean> {
    const existingRoom = await RoomModel.findOne({ roomCode }).lean();
    return !!existingRoom;
  }

  /**
   * 創建新房間
   */
  async createRoom(gameName: string, maxPlayers: number, boardId?: string): Promise<resp<Room>> {
    const out: resp<Room> = { code: 200, message: "", body: undefined as unknown as Room };
    
    try {
      // 驗證參數
      if (!gameName || !maxPlayers) {
        out.code = 400; 
        out.message = "缺少必要參數: gameName, maxPlayers"; 
        return out;
      }

      if (maxPlayers < 2 || maxPlayers > 4) {
        out.code = 400; 
        out.message = "maxPlayers 必須在 2-4 之間"; 
        return out;
      }

      // 生成唯一的房間代碼
      let roomCode: string;
      let attempts = 0;
      const maxAttempts = 10;

      do {
        roomCode = this.generateRoomCode();
        attempts++;
        
        if (attempts > maxAttempts) {
          out.code = 500; 
          out.message = "無法生成唯一房間代碼"; 
          return out;
        }
      } while (await this.isRoomCodeExists(roomCode));

      // 創建房間
      const roomData = {
        roomCode,
        gameName,
        maxPlayers,
        currentPlayers: 0,
        players: [],
        boardId,
        status: 'waiting' as const,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24小時後過期
      };

      const room = new RoomModel(roomData);
      await room.save();

      out.code = 201;
      out.message = "房間創建成功";
      out.body = room.toObject() as Room;
      return out;

    } catch (error: any) {
      out.code = 500; 
      out.message = error.message || "server error"; 
      return out;
    }
  }

  /**
   * 根據房間代碼查找房間
   */
  async getRoomByCode(roomCode: string): Promise<resp<Room>> {
    const out: resp<Room> = { code: 200, message: "", body: undefined as unknown as Room };
    
    try {
      if (!roomCode) {
        out.code = 400; 
        out.message = "缺少房間代碼"; 
        return out;
      }

      const room = await RoomModel.findOne({ roomCode }).lean();
      
      if (!room) {
        out.code = 404; 
        out.message = "房間不存在"; 
        return out;
      }

      out.code = 200;
      out.message = "房間查找成功";
      out.body = room as Room;
      return out;

    } catch (error: any) {
      out.code = 500; 
      out.message = error.message || "server error"; 
      return out;
    }
  }

  /**
   * 加入房間
   */
  async joinRoom(roomCode: string, playerId: number, playerName: string, userName?: string): Promise<resp<Room>> {
    const out: resp<Room> = { code: 200, message: "", body: undefined as unknown as Room };
    
    try {
      if (!roomCode || !playerId || !playerName) {
        out.code = 400; 
        out.message = "缺少必要參數: roomCode, playerId, playerName"; 
        return out;
      }

      const room = await RoomModel.findOne({ roomCode });
      
      if (!room) {
        out.code = 404; 
        out.message = "房間不存在"; 
        return out;
      }

      if (room.status !== 'waiting') {
        out.code = 400; 
        out.message = "房間已開始或已結束"; 
        return out;
      }

      if (room.currentPlayers >= room.maxPlayers) {
        out.code = 400; 
        out.message = "房間已滿"; 
        return out;
      }

      // 檢查玩家是否已在房間中
      const existingPlayer = room.players.find(p => p.id === playerId);
      if (existingPlayer) {
        out.code = 400; 
        out.message = "玩家已在房間中"; 
        return out;
      }

      // 加入玩家
      room.players.push({
        id: playerId,
        name: playerName,
        userName,
        isReady: false
      });
      room.currentPlayers = room.players.length;

      await room.save();

      out.code = 200;
      out.message = "加入房間成功";
      out.body = room.toObject() as Room;
      return out;

    } catch (error: any) {
      out.code = 500; 
      out.message = error.message || "server error"; 
      return out;
    }
  }

  /**
   * 離開房間
   */
  async leaveRoom(roomCode: string, playerId: number): Promise<resp<Room>> {
    const out: resp<Room> = { code: 200, message: "", body: undefined as unknown as Room };
    
    try {
      if (!roomCode || !playerId) {
        out.code = 400; 
        out.message = "缺少必要參數: roomCode, playerId"; 
        return out;
      }

      const room = await RoomModel.findOne({ roomCode });
      
      if (!room) {
        out.code = 404; 
        out.message = "房間不存在"; 
        return out;
      }

      // 移除玩家
      room.players = room.players.filter(p => p.id !== playerId);
      room.currentPlayers = room.players.length;

      // 如果房間空了，刪除房間
      if (room.currentPlayers === 0) {
        await RoomModel.deleteOne({ _id: room._id });
        out.code = 200;
        out.message = "房間已清空並刪除";
        out.body = room.toObject() as Room;
        return out;
      }

      await room.save();

      out.code = 200;
      out.message = "離開房間成功";
      out.body = room.toObject() as Room;
      return out;

    } catch (error: any) {
      out.code = 500; 
      out.message = error.message || "server error"; 
      return out;
    }
  }

  /**
   * 更新玩家準備狀態
   */
  async updatePlayerReady(roomCode: string, playerId: number, isReady: boolean): Promise<resp<Room>> {
    const out: resp<Room> = { code: 200, message: "", body: undefined as unknown as Room };
    
    try {
      if (!roomCode || !playerId) {
        out.code = 400; 
        out.message = "缺少必要參數: roomCode, playerId"; 
        return out;
      }

      const room = await RoomModel.findOne({ roomCode });
      
      if (!room) {
        out.code = 404; 
        out.message = "房間不存在"; 
        return out;
      }

      const player = room.players.find(p => p.id === playerId);
      if (!player) {
        out.code = 404; 
        out.message = "玩家不在房間中"; 
        return out;
      }

      player.isReady = isReady;
      await room.save();

      out.code = 200;
      out.message = "玩家狀態更新成功";
      out.body = room.toObject() as Room;
      return out;

    } catch (error: any) {
      out.code = 500; 
      out.message = error.message || "server error"; 
      return out;
    }
  }

  /**
   * 更新房間狀態
   */
  async updateRoomStatus(roomCode: string, status: 'waiting' | 'in_progress' | 'completed' | 'abandoned'): Promise<resp<Room>> {
    const out: resp<Room> = { code: 200, message: "", body: undefined as unknown as Room };
    
    try {
      if (!roomCode || !status) {
        out.code = 400; 
        out.message = "缺少必要參數: roomCode, status"; 
        return out;
      }

      const room = await RoomModel.findOneAndUpdate(
        { roomCode },
        { status },
        { new: true }
      );
      
      if (!room) {
        out.code = 404; 
        out.message = "房間不存在"; 
        return out;
      }

      out.code = 200;
      out.message = "房間狀態更新成功";
      out.body = room.toObject() as Room;
      return out;

    } catch (error: any) {
      out.code = 500; 
      out.message = error.message || "server error"; 
      return out;
    }
  }
}

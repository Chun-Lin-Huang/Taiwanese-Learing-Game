import { MonopolyHistoryModel } from "../orm/schemas/monopolyHistorySchemas";
import { MonopolyHistory, GameAction } from "../interfaces/MonopolyHistory";
import { resp } from "../utils/resp";
import { Types } from "mongoose";

export class MonopolyHistoryService {
  /**
   * 創建新的遊戲記錄
   */
  async createGame(gameData: {
    gameId: string;
    gameName: string;
    boardId: string;
    players: Array<{
      id: number;
      name: string;
      userName?: string;
    }>;
  }): Promise<resp<MonopolyHistory>> {
    const out: resp<MonopolyHistory> = { code: 200, message: "", body: undefined as unknown as MonopolyHistory };
    try {
      // 如果提供了 boardId，驗證其有效性
      if (gameData.boardId && !Types.ObjectId.isValid(gameData.boardId)) {
        out.code = 400; out.message = "invalid boardId"; return out;
      }

      // 先檢查遊戲是否已存在
      const existingGame = await MonopolyHistoryModel.findOne({ gameId: gameData.gameId });
      if (existingGame) {
        out.code = 200;
        out.message = "game already exists, returning existing game";
        out.body = existingGame.toObject() as unknown as MonopolyHistory;
        return out;
      }

      const gameHistory = await MonopolyHistoryModel.create({
        gameId: gameData.gameId,
        gameName: gameData.gameName,
        boardId: gameData.boardId ? new Types.ObjectId(gameData.boardId) : undefined,
        players: gameData.players,
        actions: [],
        startTime: new Date(),
        gameStatus: 'in_progress'
      });

      out.code = 200;
      out.message = "game created successfully";
      out.body = gameHistory.toObject() as unknown as MonopolyHistory;
      return out;
    } catch (error: any) {
      out.code = 500; out.message = "server error"; return out;
    }
  }

  /**
   * 添加遊戲動作到現有遊戲記錄
   */
  async addGameAction(
    gameId: string, 
    action: Omit<GameAction, '_id'>
  ): Promise<resp<MonopolyHistory>> {
    const out: resp<MonopolyHistory> = { code: 200, message: "", body: undefined as unknown as MonopolyHistory };
    try {
      const gameHistory = await MonopolyHistoryModel.findOneAndUpdate(
        { gameId: gameId },
        { 
          $push: { 
            actions: {
              ...action,
              timestamp: action.timestamp || new Date()
            }
          }
        },
        { new: true }
      );

      if (!gameHistory) {
        out.code = 404; out.message = "game not found"; return out;
      }

      out.code = 200;
      out.message = "action added successfully";
      out.body = gameHistory.toObject() as unknown as MonopolyHistory;
      return out;
    } catch (error: any) {
      out.code = 500; out.message = "server error"; return out;
    }
  }

  /**
   * 結束遊戲並設置獲勝者
   */
  async endGame(
    gameId: string, 
    winner?: {
      playerId: number;
      playerName: string;
      reason: string;
    },
    finalPlayers?: Array<{
      id: number;
      finalScore?: number;
      finalRound?: number;
    }>
  ): Promise<resp<MonopolyHistory>> {
    const out: resp<MonopolyHistory> = { code: 200, message: "", body: undefined as unknown as MonopolyHistory };
    try {
      const updateData: any = {
        endTime: new Date(),
        gameStatus: 'completed'
      };

      if (winner) {
        updateData.winner = winner;
      }

      if (finalPlayers && finalPlayers.length > 0) {
        // 先更新玩家的最終分數和回合數
        for (const finalPlayer of finalPlayers) {
          await MonopolyHistoryModel.updateOne(
            { gameId: gameId, 'players.id': finalPlayer.id },
            { 
              $set: {
                'players.$.finalScore': finalPlayer.finalScore,
                'players.$.finalRound': finalPlayer.finalRound
              }
            }
          );
        }
      }

      const gameHistory = await MonopolyHistoryModel.findOneAndUpdate(
        { gameId: gameId },
        updateData,
        { new: true }
      );

      if (!gameHistory) {
        out.code = 404; out.message = "game not found"; return out;
      }

      out.code = 200;
      out.message = "game ended successfully";
      out.body = gameHistory.toObject() as unknown as MonopolyHistory;
      return out;
    } catch (error: any) {
      out.code = 500; out.message = "server error"; return out;
    }
  }

  /**
   * 根據遊戲ID獲取遊戲記錄
   */
  async getGameById(gameId: string): Promise<resp<MonopolyHistory>> {
    const out: resp<MonopolyHistory> = { code: 200, message: "", body: undefined as unknown as MonopolyHistory };
    try {
      const gameHistory = await MonopolyHistoryModel.findOne({ gameId: gameId }).lean();

      if (!gameHistory) {
        out.code = 404; out.message = "game not found"; return out;
      }

      out.code = 200;
      out.message = "game found";
      out.body = gameHistory as unknown as MonopolyHistory;
      return out;
    } catch (error: any) {
      out.code = 500; out.message = "server error"; return out;
    }
  }

  /**
   * 獲取玩家的遊戲歷史記錄
   */
  async getPlayerGames(playerId: number, limit: number = 10): Promise<resp<MonopolyHistory[]>> {
    const out: resp<MonopolyHistory[]> = { code: 200, message: "", body: undefined as unknown as MonopolyHistory[] };
    try {
      const games = await MonopolyHistoryModel.find({
        'players.id': playerId,
        gameStatus: 'completed'
      })
      .sort({ endTime: -1 })
      .limit(limit)
      .lean();

      out.code = 200;
      out.message = "player games found";
      out.body = games as unknown as MonopolyHistory[];
      return out;
    } catch (error: any) {
      out.code = 500; out.message = "server error"; return out;
    }
  }

  /**
   * 獲取最近的遊戲記錄
   */
  async getRecentGames(limit: number = 10): Promise<resp<MonopolyHistory[]>> {
    const out: resp<MonopolyHistory[]> = { code: 200, message: "", body: undefined as unknown as MonopolyHistory[] };
    try {
      const games = await MonopolyHistoryModel.find({
        gameStatus: 'completed'
      })
      .sort({ startTime: -1 })
      .limit(limit)
      .lean();

      if (games.length === 0) {
        out.code = 404;
        out.message = "game not found";
        return out;
      }

      out.code = 200;
      out.message = "recent games found";
      out.body = games as unknown as MonopolyHistory[];
      return out;
    } catch (error: any) {
      out.code = 500; out.message = "server error"; return out;
    }
  }

  /**
   * 更新遊戲狀態（用於放棄遊戲等情況）
   */
  async updateGameStatus(gameId: string, status: 'in_progress' | 'completed' | 'abandoned'): Promise<resp<MonopolyHistory>> {
    const out: resp<MonopolyHistory> = { code: 200, message: "", body: undefined as unknown as MonopolyHistory };
    try {
      const gameHistory = await MonopolyHistoryModel.findOneAndUpdate(
        { gameId: gameId },
        { 
          gameStatus: status,
          endTime: status !== 'in_progress' ? new Date() : undefined
        },
        { new: true }
      );

      if (!gameHistory) {
        out.code = 404; out.message = "game not found"; return out;
      }

      out.code = 200;
      out.message = "game status updated";
      out.body = gameHistory.toObject() as unknown as MonopolyHistory;
      return out;
    } catch (error: any) {
      out.code = 500; out.message = "server error"; return out;
    }
  }
}

import { Request, Response } from "express";
import { GameHistoryService } from "../Service/GameHistoryService";
import { GameHistory, GameAction } from "../interfaces/GameHistory";

export class GameHistoryController {
  private service: GameHistoryService;

  constructor() {
    this.service = new GameHistoryService();
  }

  /**
   * 創建新的遊戲記錄
   */
  public async createGame(req: Request, res: Response) {
    try {
      const { gameId, gameName, boardId, players } = req.body;

      if (!gameId || !gameName || !players) {
        return res.status(400).json({ 
          code: 400, 
          message: "缺少必要參數: gameId, gameName, players" 
        });
      }

      if (!Array.isArray(players) || players.length === 0) {
        return res.status(400).json({ 
          code: 400, 
          message: "players 必須是非空陣列" 
        });
      }

      const result = await this.service.createGame({
        gameId,
        gameName,
        boardId,
        players
      });

      return res.status(result.code).send(result);
    } catch (err: any) {
      return res.status(500).json({ 
        code: 500, 
        message: err.message || "server error" 
      });
    }
  }

  /**
   * 添加遊戲動作
   */
  public async addGameAction(req: Request, res: Response) {
    try {
      const { gameId } = req.params;
      const actionData = req.body;

      if (!gameId) {
        return res.status(400).json({ 
          code: 400, 
          message: "缺少 gameId 參數" 
        });
      }

      if (!actionData.actionType || !actionData.playerId || !actionData.playerName || !actionData.description) {
        return res.status(400).json({ 
          code: 400, 
          message: "缺少必要參數: actionType, playerId, playerName, description" 
        });
      }

      const action: Omit<GameAction, '_id'> = {
        actionType: actionData.actionType,
        playerId: actionData.playerId,
        playerName: actionData.playerName,
        description: actionData.description,
        details: actionData.details,
        timestamp: actionData.timestamp ? new Date(actionData.timestamp) : new Date()
      };

      const result = await this.service.addGameAction(gameId, action);

      return res.status(result.code).send(result);
    } catch (err: any) {
      return res.status(500).json({ 
        code: 500, 
        message: err.message || "server error" 
      });
    }
  }

  /**
   * 結束遊戲
   */
  public async endGame(req: Request, res: Response) {
    try {
      const { gameId } = req.params;
      const { winner, finalPlayers } = req.body;

      if (!gameId) {
        return res.status(400).json({ 
          code: 400, 
          message: "缺少 gameId 參數" 
        });
      }

      const result = await this.service.endGame(gameId, winner, finalPlayers);

      return res.status(result.code).send(result);
    } catch (err: any) {
      return res.status(500).json({ 
        code: 500, 
        message: err.message || "server error" 
      });
    }
  }

  /**
   * 根據遊戲ID獲取遊戲記錄
   */
  public async getGameById(req: Request, res: Response) {
    try {
      const { gameId } = req.params;

      if (!gameId) {
        return res.status(400).json({ 
          code: 400, 
          message: "缺少 gameId 參數" 
        });
      }

      const result = await this.service.getGameById(gameId);

      return res.status(result.code).send(result);
    } catch (err: any) {
      return res.status(500).json({ 
        code: 500, 
        message: err.message || "server error" 
      });
    }
  }

  /**
   * 獲取玩家的遊戲歷史記錄
   */
  public async getPlayerGames(req: Request, res: Response) {
    try {
      const { playerId } = req.params;
      const limit = parseInt(req.query.limit as string) || 10;

      if (!playerId || isNaN(parseInt(playerId))) {
        return res.status(400).json({ 
          code: 400, 
          message: "缺少或無效的 playerId 參數" 
        });
      }

      const result = await this.service.getPlayerGames(parseInt(playerId), limit);

      return res.status(result.code).send(result);
    } catch (err: any) {
      return res.status(500).json({ 
        code: 500, 
        message: err.message || "server error" 
      });
    }
  }

  /**
   * 獲取最近的遊戲記錄
   */
  public async getRecentGames(req: Request, res: Response) {
    try {
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await this.service.getRecentGames(limit);

      return res.status(result.code).send(result);
    } catch (err: any) {
      return res.status(500).json({ 
        code: 500, 
        message: err.message || "server error" 
      });
    }
  }

  /**
   * 更新遊戲狀態
   */
  public async updateGameStatus(req: Request, res: Response) {
    try {
      const { gameId } = req.params;
      const { status } = req.body;

      if (!gameId) {
        return res.status(400).json({ 
          code: 400, 
          message: "缺少 gameId 參數" 
        });
      }

      if (!status || !['in_progress', 'completed', 'abandoned'].includes(status)) {
        return res.status(400).json({ 
          code: 400, 
          message: "缺少或無效的 status 參數" 
        });
      }

      const result = await this.service.updateGameStatus(gameId, status);

      return res.status(result.code).send(result);
    } catch (err: any) {
      return res.status(500).json({ 
        code: 500, 
        message: err.message || "server error" 
      });
    }
  }
}

// src/controller/GameQuestionController.ts
import { Contorller } from "../abstract/Contorller";
import { Request, Response } from "express";
import { GameQuestionService } from "../Service/GameQuestionService";

export class GameQuestionController extends Contorller {
  protected service: GameQuestionService;

  constructor() {
    super();
    this.service = new GameQuestionService();
  }

  // GET /api/v1/game-questions/by-game/:gameId?count=10
  public async listByGame(req: Request, res: Response) {
    const { gameId } = req.params;
    const count = req.query.count ? Number(req.query.count) : undefined;

    // 避免 ObjectId 轉換丟錯
    if (!gameId) {
      return res.status(400).json({ code: 400, message: "gameId required" });
    }

    const result = await this.service.listByGame(gameId, count);
    return res.status(result.code).send(result);
  }
}
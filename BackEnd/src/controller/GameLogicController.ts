// src/controller/GameLogicController.ts
import { Contorller } from "../abstract/Contorller";
import { Request, Response } from "express";
import { GameLogicService } from "../Service/GameLogicService";
import type { resp } from "../utils/resp";
import type { GameMoveRequest } from "../interfaces/GameMove";

export class GameLogicController extends Contorller {
  protected service: GameLogicService;

  constructor() {
    super();
    this.service = new GameLogicService();
  }

  /** POST /api/v1/game/move */
  public async move(req: Request, res: Response) {
    const out: resp<any> = { code: 200, message: "", body: undefined };
    try {
      const moveRequest: GameMoveRequest = req.body;
      const result = await this.service.calculateMove(moveRequest);
      return res.status(result.code).send(result);
    } catch (err: any) {
      out.code = 500; out.message = err.message || "server error";
      return res.status(500).send(out);
    }
  }

  /** GET /api/v1/game/mapInfo/:boardId */
  public async getMapInfo(req: Request, res: Response) {
    const out: resp<any> = { code: 200, message: "", body: undefined };
    try {
      const { boardId } = req.params;
      const result = await this.service.getMapInfo(boardId);
      return res.status(result.code).send(result);
    } catch (err: any) {
      out.code = 500; out.message = err.message || "server error";
      return res.status(500).send(out);
    }
  }
}

import { Contorller } from "../abstract/Contorller";
import { Request, Response } from "express";
import { GameService } from "../Service/GameService";

export class GameController extends Contorller {
  protected service: GameService;
  constructor(){ super(); this.service = new GameService(); }

  /** GET /api/v1/game/latest/by-category/:categoryId */
  public async getLatestByCategoryId(req: Request, res: Response) {
    const { categoryId } = req.params;
    const r = await this.service.getLatestByCategoryId(categoryId);
    res.status(r.code).send(r);
  }
}
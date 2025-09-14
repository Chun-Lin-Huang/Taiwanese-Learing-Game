import { Contorller } from "../abstract/Contorller";
import { Request, Response } from "express";
import { CardService } from "../Service/CardService";

export class CardController extends Contorller {
  protected service: CardService;
  
  constructor() { 
    super(); 
    this.service = new CardService(); 
  }

  /** GET /api/v1/cards/:code - 根據 code 查詢卡片 */
  public async getCardByCode(req: Request, res: Response) {
    const { code } = req.params;
    const result = await this.service.getCardByCode(code);
    res.status(result.code).send(result);
  }

  /** GET /api/v1/cards - 獲取所有卡片 */
  public async getAllCards(req: Request, res: Response) {
    const result = await this.service.getAllCards();
    res.status(result.code).send(result);
  }

  /** GET /api/v1/cards/type/:type - 根據類型獲取卡片 */
  public async getCardsByType(req: Request, res: Response) {
    const { type } = req.params;
    const result = await this.service.getCardsByType(type as "reward" | "penalty" | "chance");
    res.status(result.code).send(result);
  }
}

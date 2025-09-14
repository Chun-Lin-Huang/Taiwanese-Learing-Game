import { Route } from "../abstract/Route";
import { CardController } from "../controller/CardController";

export class CardRoute extends Route {
  protected url = "/api/v1/cards/";
  protected Contorller = new CardController();

  constructor() { 
    super(); 
    this.setRoutes(); 
  }

  protected setRoutes(): void {
    // GET /api/v1/cards/:code - 根據 code 查詢卡片
    this.router.get(`${this.url}:code`, (req, res) =>
      this.Contorller.getCardByCode(req, res)
    );

    // GET /api/v1/cards - 獲取所有卡片
    this.router.get(this.url, (req, res) =>
      this.Contorller.getAllCards(req, res)
    );

    // GET /api/v1/cards/type/:type - 根據類型獲取卡片
    this.router.get(`${this.url}type/:type`, (req, res) =>
      this.Contorller.getCardsByType(req, res)
    );
  }
}

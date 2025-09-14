import { Route } from "../abstract/Route";
import { CardUseController } from "../controller/CardUseController";

export class CardUseRoute extends Route {
  protected url = "/api/v1/game/";
  protected Contorller = new CardUseController();

  constructor() { 
    super(); 
    this.setRoutes(); 
  }

  protected setRoutes(): void {
    // POST /api/v1/game/use-card - 使用卡片
    this.router.post(`${this.url}use-card`, (req, res) =>
      this.Contorller.useCard(req, res)
    );

    // POST /api/v1/game/swap-positions - 交換玩家位置
    this.router.post(`${this.url}swap-positions`, (req, res) =>
      this.Contorller.swapPositions(req, res)
    );
  }
}

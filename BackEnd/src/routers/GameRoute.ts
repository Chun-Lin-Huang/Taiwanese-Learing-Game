import { Route } from "../abstract/Route";
import { GameController } from "../controller/GameController";

export class GameRoute extends Route {
  protected url = "/api/v1/game/";
  protected Contorller = new GameController();

  constructor(){ super(); this.setRoutes(); }

  protected setRoutes(): void {
    // 只留開始遊戲會用到的這一支
    this.router.get(`${this.url}by-category/:categoryId`, (req, res) =>
      this.Contorller.getLatestByCategoryId(req, res)
    );
  }
}
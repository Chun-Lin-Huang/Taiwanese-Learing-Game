// src/routes/GameQuestionRoute.ts
import { Route } from "../abstract/Route";
import { GameQuestionController } from "../controller/GameQuestionController";

export class GameQuestionRoute extends Route {
  protected url = "/api/v1/game-questions/";
  protected Contorller = new GameQuestionController();

  constructor() {
    super();
    this.setRoutes();
  }

  protected setRoutes(): void {
    // 依 gameId 取題目，可用 ?count=10 隨機抽 N 題
    this.router.get(`${this.url}by-game/:gameId`, (req, res) =>
      this.Contorller.listByGame(req, res)
    );
  }
}
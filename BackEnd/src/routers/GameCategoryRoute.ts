// src/routes/GameCategoryRoute.ts
import { Route } from "../abstract/Route";
import { GameCategoriesController } from "../controller/GameCategoriesController";

export class GameCategoryRoute extends Route {
  protected url = "/api/v1/game-categories/";
  protected Contorller = new GameCategoriesController();

  constructor() {
    super();
    this.setRoutes();
  }

  protected setRoutes(): void {
    // 這邊會對應 GET /api/v1/game-categories/id-by-name
    this.router.get(`${this.url}id-by-name`, (req, res) => this.Contorller.getIdByName(req, res));
  }
}
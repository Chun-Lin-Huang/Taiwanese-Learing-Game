// src/routes/SentenceRoute.ts
import { Route } from "../abstract/Route";
import { SentenceController } from "../controller/SentenceController";

export class SentenceRoute extends Route {
  protected url = "/api/v1/sentences/";
  protected Contorller = new SentenceController(); // 依你原本的命名

  constructor() {
    super();
    this.setRoutes();
  }

  protected setRoutes(): void {
    // GET /api/v1/sentences/by-card/:cardId
    this.router.get(`${this.url}by-card/:cardId`, (req, res) =>
      this.Contorller.listByCard(req, res)
    );
  }
}
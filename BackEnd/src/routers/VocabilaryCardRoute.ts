// src/routes/VocabularyCardRoute.ts
import { Route } from "../abstract/Route";
import { VocabularyCardController } from "../controller/VocabularyCardController";

export class VocabularyCardRoute extends Route {
  protected url = "/api/v1/vocab-cards/";
  protected Contorller = new VocabularyCardController();

  constructor() {
    super();
    this.setRoutes();
  }

  protected setRoutes(): void {
    // 依分類取單字卡清單
    // GET /api/v1/vocab-cards/by-category/:categoryId
    this.router.get(`${this.url}by-category/:categoryId`, (req, res) =>
      this.Contorller.getByCategory(req, res)
    );

    this.router.get(`${this.url}:cardId`, (req, res) =>
      this.Contorller.getById(req, res)
    );
  }
}
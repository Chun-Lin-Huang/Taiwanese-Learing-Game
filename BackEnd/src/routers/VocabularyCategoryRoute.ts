// src/routes/VocabularyCategoryRoute.ts
import { Route } from "../abstract/Route";
import { VocabularyCategoryController } from "../controller/VocabularyCategoryController";

export class VocabularyCategoryRoute extends Route {
  protected url = "/api/v1/vocab-categories/";
  protected Contorller = new VocabularyCategoryController();

  constructor() {
    super();
    this.setRoutes();
  }

  protected setRoutes(): void {
    // 取得清單（支援 ?keyword=...）
    this.router.get(`${this.url}list`, (req, res) =>
      this.Contorller.list(req, res)
    );

    // 串流分類圖片
    this.router.get(`${this.url}stream/:id`, (req, res) =>
      this.Contorller.stream(req, res)
    );
  }
}
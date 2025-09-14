// src/routes/VocabProgressRoute.ts
import { Route } from "../abstract/Route";
import { VocabProgressController } from "../controller/VocabProgressController";

export class VocabProgressRoute extends Route {
  protected url = "/api/v1/vocab-progress/";
  protected Contorller = new VocabProgressController();

  constructor() {
    super();
    this.setRoutes();
  }

  protected setRoutes(): void {
    // 讀取進度
    this.router.get(`${this.url}:userId/:categoryId`, (req, res) =>
      this.Contorller.get(req, res)
    );
    // 更新/儲存進度（upsert）
    this.router.post(`${this.url}update`, (req, res) =>
      this.Contorller.update(req, res)
    );
  }
}
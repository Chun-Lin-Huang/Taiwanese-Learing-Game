// src/routers/VocabularyPictureRoute.ts
import { Route } from "../abstract/Route";
import { VocabularyPictureController } from "../controller/VocabularyPictureController";

export class VocabularyPictureRoute extends Route {
  protected url = "/api/v1/vocabulary-pictures/";
  protected Contorller = new VocabularyPictureController();

  constructor() {
    super();
    this.setRoutes();
  }

  protected setRoutes(): void {
    // 依分類取圖片總覽清單
    // GET /api/v1/vocabulary-pictures/by-category/:categoryId
    this.router.get(`${this.url}by-category/:categoryId`, (req, res) =>
      this.Contorller.getByCategory(req, res)
    );

    // 串流圖片檔案
    // GET /api/v1/vocabulary-pictures/stream/:id
    this.router.get(`${this.url}stream/:id`, (req, res) =>
      this.Contorller.stream(req, res)
    );

    // 依單字卡ID取對應圖片
    // GET /api/v1/vocabulary-pictures/by-card/:cardId
    this.router.get(`${this.url}by-card/:cardId`, (req, res) =>
      this.Contorller.getByCardId(req, res)
    );
  }
}

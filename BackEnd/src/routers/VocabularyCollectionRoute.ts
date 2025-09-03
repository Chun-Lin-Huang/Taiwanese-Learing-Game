// src/routes/VocabularyCollectionRoute.ts
import { Route } from "../abstract/Route";
import { VocabularyCollectionController } from "../controller/VocabularyCollectionController";

export class VocabularyCollectionRoute extends Route {
  protected url = "/api/v1/vocab-collection/";
  protected Contorller = new VocabularyCollectionController();

  constructor() {
    super();
    this.setRoutes();
  }

  protected setRoutes(): void {
    this.router.get(`${this.url}:userId`, (req, res) =>
      this.Contorller.list(req, res)
    );

    this.router.get(`${this.url}has/:userId/:cardId`, (req, res) =>
      this.Contorller.has(req, res)
    );

    this.router.post(`${this.url}add`, (req, res) =>
      this.Contorller.add(req, res)
    );

    this.router.delete(`${this.url}remove`, (req, res) =>
      this.Contorller.remove(req, res)
    );

    this.router.post(`${this.url}toggle`, (req, res) =>
      this.Contorller.toggle(req, res)
    );
  }
}
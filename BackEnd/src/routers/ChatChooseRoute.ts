// src/routes/ChatChooseRoute.ts
import { Route } from "../abstract/Route";
import { ChatChooseController } from "../controller/ChatChooseController";

export class ChatChooseRoute extends Route {
  protected url = "/api/v1/chat-choose/";
  protected Contorller = new ChatChooseController();

  constructor() {
    super();
    this.setRoutes();
  }

  protected setRoutes(): void {
    // GET /api/v1/chat-choose/
    this.router.get(`${this.url}list`, (req, res) => this.Contorller.list(req, res));

    // GET /api/v1/chat-choose/:id
    this.router.get(`${this.url}:id`, (req, res) => this.Contorller.getOne(req, res));
  }
}
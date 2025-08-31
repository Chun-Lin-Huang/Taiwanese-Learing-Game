// src/routes/StoryNameRoute.ts
import { Route } from "../abstract/Route";
import { StoryNameController } from "../controller/StoryNameController";

export class StoryNameRoute extends Route {
  protected url = "/api/v1/story-name/";
  protected Contorller = new StoryNameController();

  constructor() {
    super();
    this.setRoutes();
  }

  protected setRoutes(): void {
    this.router.get(`${this.url}list`, (req, res) => this.Contorller.list(req, res));
    this.router.get(`${this.url}search`, (req, res) => this.Contorller.search(req, res));
    this.router.get(`${this.url}stream/:id`, (req, res) => this.Contorller.streamImage(req, res));
  }
}
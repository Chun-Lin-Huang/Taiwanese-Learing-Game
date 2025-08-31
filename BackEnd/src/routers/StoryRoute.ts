// src/routes/StoryRoute.ts
import { Route } from "../abstract/Route";
import { StoryController } from "../controller/StoryController";

export class StoryRoute extends Route {
  protected url = "/api/v1/story/";
  protected Contorller = new StoryController();

  constructor() {
    super();
    this.setRoutes();
  }

  protected setRoutes(): void {
    this.router.get(`${this.url}:storyNameId`, (req, res) => this.Contorller.getByStoryNameId(req, res));
  }
}
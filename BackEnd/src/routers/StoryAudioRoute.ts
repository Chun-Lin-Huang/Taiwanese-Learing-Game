// src/routes/StoryAudioRoute.ts
import { Route } from "../abstract/Route";
import { StoryAudioController } from "../controller/StoryAudioController";

export class StoryAudioRoute extends Route {
  protected url = "/api/v1/story-audio/";
  protected Contorller = new StoryAudioController();

  constructor() {
    super();
    this.setRoutes();
  }

  protected setRoutes(): void {
    this.router.get(`${this.url}by-story-name/:storyNameId`, (req, res) =>
      this.Contorller.byStoryNameId(req, res)
    );
    this.router.get(`${this.url}stream/:id`, (req, res) =>
      this.Contorller.stream(req, res)
    );
  }
}
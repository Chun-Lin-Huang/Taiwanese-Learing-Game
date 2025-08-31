import { Route } from "../abstract/Route";
import { StoryCollectionController } from "../controller/StoryCollectionController";

export class StoryCollectionRoute extends Route {
  protected url = "/api/v1/story-collection/";
  protected Contorller = new StoryCollectionController();

  constructor() {
    super();
    this.setRoutes();
  }

  protected setRoutes(): void {
    // 改成 userId
    this.router.get(`${this.url}:userId`, (req, res) =>
      this.Contorller.getByUser(req, res)
    );

    this.router.post(`${this.url}add`, (req, res) =>
      this.Contorller.addStory(req, res)
    );

    this.router.delete(`${this.url}remove`, (req, res) =>
      this.Contorller.removeStory(req, res)
    );
  }
}
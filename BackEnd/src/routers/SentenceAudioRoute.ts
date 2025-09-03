import { Route } from "../abstract/Route";
import { SentenceAudioController } from "../controller/SentenceAudioController";

export class SentenceAudioRoute extends Route {
  protected url = "/api/v1/sentence-audio/";
  protected Contorller = new SentenceAudioController();

  constructor() {
    super();
    this.setRoutes();
  }

  protected setRoutes(): void {
    // 串流例句音檔
    this.router.get(`${this.url}stream/:id`, (req, res) =>
      this.Contorller.stream(req, res)
    );
  }
}
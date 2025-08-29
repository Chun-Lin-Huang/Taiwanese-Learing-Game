// src/routes/AudioRoute.ts
import { Route } from "../abstract/Route";
import { AudioController } from "../controller/AudioController";

export class AudioRoute extends Route {
  protected url = "/api/v1/audio/";
  protected Contorller = new AudioController();

  constructor() {
    super();
    this.setRoutes();
  }

  protected setRoutes(): void {
    // ① 依 questionId 取得音檔（含可播 URL）
    this.router.get(`${this.url}by-question/:questionId`, (req, res) =>
      this.Contorller.byQuestion(req, res)
    );

    // ② 串流播放音檔
    this.router.get(`${this.url}stream/:audioId`, (req, res) =>
      this.Contorller.stream(req, res)
    );
  }
}
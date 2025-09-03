// src/routers/VocabularyAudioRoute.ts
import { Route } from "../abstract/Route";
import { VocabularyAudioController } from "../controller/VocabularyAudioController";

export class VocabularyAudioRoute extends Route {
  protected url = "/api/v1/vocab-audio/";
  protected Contorller = new VocabularyAudioController();

  constructor() {
    super();
    this.setRoutes();
  }

  protected setRoutes(): void {
    // 以 VocabularyAudio._id 串流
    this.router.get(`${this.url}stream/:id`, (req, res) =>
      this.Contorller.streamByDoc(req, res)
    );
  }
}
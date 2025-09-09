import { Route } from "../abstract/Route";
import { ScenarioController } from "../controller/ScenarioController";

export class ScenarioRoute extends Route {
  protected url = "/api/v1/scenario/";
  protected Contorller = new ScenarioController(); // 注意：跟 abstract 的拼字一致

  constructor() {
    super();
    this.setRoutes();
  }

  protected setRoutes(): void {
    // POST /api/v1/scenario/start
    this.router.post(`${this.url}start`, (req, res) => this.Contorller.start(req, res));

    // POST /api/v1/scenario/turn_text
    this.router.post(`${this.url}turn_text`, (req, res) => this.Contorller.turnText(req, res));

    // GET /api/v1/scenario/history/:sessionId
    this.router.get(`${this.url}history/:sessionId`, (req, res) => this.Contorller.getHistory(req, res));
  }
}
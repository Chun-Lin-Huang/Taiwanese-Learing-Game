"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameRoute = void 0;
const Route_1 = require("../abstract/Route");
const GameController_1 = require("../controller/GameController");
class GameRoute extends Route_1.Route {
    constructor() {
        super();
        this.url = "/api/v1/game/";
        this.Contorller = new GameController_1.GameController();
        this.setRoutes();
    }
    setRoutes() {
        // 只留開始遊戲會用到的這一支
        this.router.get(`${this.url}by-category/:categoryId`, (req, res) => this.Contorller.getLatestByCategoryId(req, res));
    }
}
exports.GameRoute = GameRoute;

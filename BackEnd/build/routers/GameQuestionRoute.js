"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameQuestionRoute = void 0;
// src/routes/GameQuestionRoute.ts
const Route_1 = require("../abstract/Route");
const GameQuestionController_1 = require("../controller/GameQuestionController");
class GameQuestionRoute extends Route_1.Route {
    constructor() {
        super();
        this.url = "/api/v1/game-questions/";
        this.Contorller = new GameQuestionController_1.GameQuestionController();
        this.setRoutes();
    }
    setRoutes() {
        // 依 gameId 取題目，可用 ?count=10 隨機抽 N 題
        this.router.get(`${this.url}by-game/:gameId`, (req, res) => this.Contorller.listByGame(req, res));
    }
}
exports.GameQuestionRoute = GameQuestionRoute;

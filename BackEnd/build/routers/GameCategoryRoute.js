"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameCategoryRoute = void 0;
// src/routes/GameCategoryRoute.ts
const Route_1 = require("../abstract/Route");
const GameCategoriesController_1 = require("../controller/GameCategoriesController");
class GameCategoryRoute extends Route_1.Route {
    constructor() {
        super();
        this.url = "/api/v1/game-categories/";
        this.Contorller = new GameCategoriesController_1.GameCategoriesController();
        this.setRoutes();
    }
    setRoutes() {
        // 這邊會對應 GET /api/v1/game-categories/id-by-name
        this.router.get(`${this.url}id-by-name`, (req, res) => this.Contorller.getIdByName(req, res));
    }
}
exports.GameCategoryRoute = GameCategoryRoute;

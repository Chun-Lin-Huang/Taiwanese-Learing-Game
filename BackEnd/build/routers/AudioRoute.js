"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AudioRoute = void 0;
// src/routes/AudioRoute.ts
const Route_1 = require("../abstract/Route");
const AudioController_1 = require("../controller/AudioController");
class AudioRoute extends Route_1.Route {
    constructor() {
        super();
        this.url = "/api/v1/audio/";
        this.Contorller = new AudioController_1.AudioController();
        this.setRoutes();
    }
    setRoutes() {
        // ① 依 questionId 取得音檔（含可播 URL）
        this.router.get(`${this.url}by-question/:questionId`, (req, res) => this.Contorller.byQuestion(req, res));
        // ② 串流播放音檔
        this.router.get(`${this.url}stream/:audioId`, (req, res) => this.Contorller.stream(req, res));
    }
}
exports.AudioRoute = AudioRoute;

"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameQuestionController = void 0;
// src/controller/GameQuestionController.ts
const Contorller_1 = require("../abstract/Contorller");
const GameQuestionService_1 = require("../Service/GameQuestionService");
class GameQuestionController extends Contorller_1.Contorller {
    constructor() {
        super();
        this.service = new GameQuestionService_1.GameQuestionService();
    }
    // GET /api/v1/game-questions/by-game/:gameId?count=10
    listByGame(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { gameId } = req.params;
            const count = req.query.count ? Number(req.query.count) : undefined;
            // 避免 ObjectId 轉換丟錯
            if (!gameId) {
                return res.status(400).json({ code: 400, message: "gameId required" });
            }
            const result = yield this.service.listByGame(gameId, count);
            return res.status(result.code).send(result);
        });
    }
}
exports.GameQuestionController = GameQuestionController;

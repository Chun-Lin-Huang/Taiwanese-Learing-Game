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
exports.GameController = void 0;
const Contorller_1 = require("../abstract/Contorller");
const GameService_1 = require("../Service/GameService");
class GameController extends Contorller_1.Contorller {
    constructor() { super(); this.service = new GameService_1.GameService(); }
    /** GET /api/v1/game/latest/by-category/:categoryId */
    getLatestByCategoryId(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { categoryId } = req.params;
            const r = yield this.service.getLatestByCategoryId(categoryId);
            res.status(r.code).send(r);
        });
    }
}
exports.GameController = GameController;

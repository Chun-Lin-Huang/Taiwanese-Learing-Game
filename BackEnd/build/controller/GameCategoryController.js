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
exports.GameCategoryController = void 0;
const Contorller_1 = require("../abstract/Contorller");
const GameCategoryService_1 = require("../Service/GameCategoryService");
class GameCategoryController extends Contorller_1.Contorller {
    constructor() {
        super();
        this.service = new GameCategoryService_1.GameCategoryService();
    }
    // 取得遊戲主題清單
    list(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const r = yield this.service.list();
            return res.status(r.code).json(r);
        });
    }
    // 根據名稱查找主題
    findByName(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { name } = req.params;
            if (!name)
                return res.status(400).json({ code: 400, message: "缺少名稱" });
            const r = yield this.service.findByName(name);
            return res.status(r.code).json(r);
        });
    }
}
exports.GameCategoryController = GameCategoryController;

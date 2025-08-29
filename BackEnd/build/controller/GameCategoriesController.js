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
exports.GameCategoriesController = void 0;
// src/controller/GameCategoriesController.ts
const Contorller_1 = require("../abstract/Contorller");
const GameCategoryService_1 = require("../Service/GameCategoryService");
require('dotenv').config();
class GameCategoriesController extends Contorller_1.Contorller {
    constructor() {
        super();
        this.service = new GameCategoryService_1.GameCategoryService();
    }
    /**
     * 依名稱查 categoryId
     * 支援：
     *   - GET /api/v1/game-categories/id-by-name?name=家用品大揭秘
     *   - 或在 Body 傳 { "name": "家用品大揭秘" }
     */
    getIdByName(Request, Response) {
        var _a, _b, _c, _d, _e;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const name = (_c = (_b = (_a = Request.query) === null || _a === void 0 ? void 0 : _a.name) === null || _b === void 0 ? void 0 : _b.trim()) !== null && _c !== void 0 ? _c : (_e = (_d = Request.body) === null || _d === void 0 ? void 0 : _d.name) === null || _e === void 0 ? void 0 : _e.trim();
                if (!name) {
                    return Response.status(400).send({ code: 400, message: "缺少 name 參數" });
                }
                const resp = yield this.service.getIdByName(name);
                return Response.status(resp.code).send(resp);
            }
            catch (err) {
                return Response
                    .status(500)
                    .send({ code: 500, message: (err === null || err === void 0 ? void 0 : err.message) || "server error" });
            }
        });
    }
}
exports.GameCategoriesController = GameCategoriesController;

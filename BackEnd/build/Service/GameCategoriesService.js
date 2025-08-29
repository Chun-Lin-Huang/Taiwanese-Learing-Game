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
exports.GameCategoryService = void 0;
// src/Service/GameCategoryService.ts
const gameCategorySchemas_1 = require("../orm/schemas/gameCategorySchemas");
class GameCategoryService {
    /**
     * 依名稱查 categoryId（回傳 { id }）
     * @param name 類別名稱（前端顯示的文字）
     * @returns resp<{ id: string } | undefined>
     */
    getIdByName(name) {
        return __awaiter(this, void 0, void 0, function* () {
            const out = { code: 200, message: "", body: undefined };
            try {
                const n = (name !== null && name !== void 0 ? name : "").trim();
                if (!n) {
                    out.code = 400;
                    out.message = "缺少 name 參數";
                    return out;
                }
                // 先做精準比對；找不到再做大小寫不敏感比對
                let doc = yield gameCategorySchemas_1.GameCategoryModel
                    .findOne({ name: n, isActive: true })
                    .lean();
                if (!doc) {
                    doc = (yield gameCategorySchemas_1.GameCategoryModel
                        .findOne({
                        name: { $regex: `^${escapeRegex(n)}$`, $options: "i" },
                        isActive: true,
                    })
                        .lean());
                }
                if (!(doc === null || doc === void 0 ? void 0 : doc._id)) {
                    out.code = 404;
                    out.message = "找不到該遊戲類別";
                    return out;
                }
                out.code = 200;
                out.message = "ok";
                out.body = { id: String(doc._id) };
                return out;
            }
            catch (_a) {
                out.code = 500;
                out.message = "server error";
                return out;
            }
        });
    }
}
exports.GameCategoryService = GameCategoryService;
/** 簡單正則跳脫，避免名稱中有特殊字元時誤判 */
function escapeRegex(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

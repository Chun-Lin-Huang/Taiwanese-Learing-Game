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
exports.GameService = void 0;
const mongoose_1 = require("mongoose");
const gameSchemas_1 = require("../orm/schemas/gameSchemas");
class GameService {
    /** 取該分類最新一筆遊戲（開始遊戲會用） */
    getLatestByCategoryId(categoryId) {
        return __awaiter(this, void 0, void 0, function* () {
            const out = { code: 200, message: "", body: undefined };
            try {
                if (!mongoose_1.Types.ObjectId.isValid(categoryId)) {
                    out.code = 400;
                    out.message = "invalid categoryId";
                    return out;
                }
                const row = yield gameSchemas_1.GameModel.findOne({ categoryId: new mongoose_1.Types.ObjectId(categoryId) })
                    .sort({ createdAt: -1 })
                    .lean();
                if (!row) {
                    out.code = 404;
                    out.message = "game not found";
                    return out;
                }
                out.code = 200;
                out.message = "find success";
                out.body = row;
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
exports.GameService = GameService;

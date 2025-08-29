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
exports.GameQuestionService = void 0;
// src/Service/GameQuestionService.ts
const gameQuestionsSchemas_1 = require("../orm/schemas/gameQuestionsSchemas");
class GameQuestionService {
    listByGame(gameId, count) {
        return __awaiter(this, void 0, void 0, function* () {
            const out = { code: 200, message: "", body: undefined };
            try {
                if (!gameId) {
                    out.code = 400;
                    out.message = "gameId required";
                    return out;
                }
                const match = { gameId: String(gameId) }; // ✅ 直接用字串
                let rows;
                if (count && Number.isFinite(count)) {
                    const n = Math.max(1, Math.min(50, Math.floor(count)));
                    rows = yield gameQuestionsSchemas_1.GameQuestionModel.aggregate([
                        { $match: match },
                        { $sample: { size: n } },
                        { $project: { text: 1, options: 1, correctAnswer: 1, gameId: 1 } },
                    ]);
                }
                else {
                    rows = yield gameQuestionsSchemas_1.GameQuestionModel
                        .find(match)
                        .select("text options correctAnswer gameId")
                        .lean();
                }
                out.code = 200;
                out.message = "find success";
                out.body = rows;
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
exports.GameQuestionService = GameQuestionService;

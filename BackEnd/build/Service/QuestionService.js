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
exports.QuestionService = void 0;
const questionSchemas_1 = require("../orm/schemas/questionSchemas");
class QuestionService {
    // 建立問題
    create(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const out = { code: 200, message: "", body: undefined };
            try {
                const userName = payload.userName.toLowerCase().trim();
                const questionText = (payload.questionText || "").trim();
                if (!userName || !questionText) {
                    out.code = 400;
                    out.message = "缺少 userName 或 questionText";
                    return out;
                }
                const created = yield questionSchemas_1.QuestionModel.create({ userName, questionText });
                out.code = 201;
                out.message = "create success";
                out.body = created.toObject();
                return out;
            }
            catch (_a) {
                out.code = 500;
                out.message = "server error";
                return out;
            }
        });
    }
    // 取得清單（可選依 userName 過濾）
    list(userName) {
        return __awaiter(this, void 0, void 0, function* () {
            const out = { code: 200, message: "", body: undefined };
            try {
                const q = {};
                if (userName)
                    q.userName = String(userName).toLowerCase();
                const rows = yield questionSchemas_1.QuestionModel.find(q).sort({ createdAt: -1 }).lean();
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
    // 取得所有問題
    getAllQuestions() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const res = yield questionSchemas_1.QuestionModel.find({});
                return res;
            }
            catch (error) {
                return undefined;
            }
        });
    }
}
exports.QuestionService = QuestionService;

import { QuestionModel } from "../orm/schemas/questionSchemas";
import type { Question } from "../interfaces/Question";
import type { resp } from "../utils/resp";
import type { DBResp } from "../interfaces/DBResp";

export class QuestionService {
    // 建立問題
    async create(payload: Pick<Question, "userName" | "questionText">): Promise<resp<DBResp<Question> | undefined>> {
        const out: resp<DBResp<Question> | undefined> = { code: 200, message: "", body: undefined };
        try {
            const userName = payload.userName.toLowerCase().trim();
            const questionText = (payload.questionText || "").trim();
            if (!userName || !questionText) {
                out.code = 400; out.message = "缺少 userName 或 questionText"; return out;
            }
            const created = await QuestionModel.create({ userName, questionText });
            out.code = 201; out.message = "create success"; out.body = created.toObject() as any;
            return out;
        } catch {
            out.code = 500; out.message = "server error"; return out;
        }
    }

    // 取得清單（可選依 userName 過濾）
    async list(userName?: string): Promise<resp<DBResp<Question>[] | undefined>> {
        const out: resp<DBResp<Question>[] | undefined> = { code: 200, message: "", body: undefined };
        try {
            const q: any = {};
            if (userName) q.userName = String(userName).toLowerCase();
            const rows = await QuestionModel.find(q).sort({ createdAt: -1 }).lean();
            out.code = 200; out.message = "find success"; out.body = rows as any;
            return out;
        } catch {
            out.code = 500; out.message = "server error"; return out;
        }
    }

    // 取得所有問題
    public async getAllQuestions(): Promise<Array<DBResp<Question>> | undefined> {
        try {
            const res: Array<DBResp<Question>> = await QuestionModel.find({});
            return res;
        } catch (error) {
            return undefined;
        }
    }
}
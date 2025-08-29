// src/Service/GameQuestionService.ts
import { GameQuestionModel } from "../orm/schemas/gameQuestionsSchemas";
import type { resp } from "../utils/resp";
import type { DBResp } from "../interfaces/DBResp";
import type { GameQuestions } from "../interfaces/GameQuestions";

export class GameQuestionService {
  async listByGame(
    gameId: string,
    count?: number
  ): Promise<resp<DBResp<GameQuestions>[] | undefined>> {
    const out: resp<DBResp<GameQuestions>[] | undefined> = { code: 200, message: "", body: undefined };
    try {
      if (!gameId) { out.code = 400; out.message = "gameId required"; return out; }

      const match = { gameId: String(gameId) };   // ✅ 直接用字串

      let rows: any[];
      if (count && Number.isFinite(count)) {
        const n = Math.max(1, Math.min(50, Math.floor(count)));
        rows = await GameQuestionModel.aggregate([
          { $match: match },
          { $sample: { size: n } },
          { $project: { text: 1, options: 1, correctAnswer: 1, gameId: 1 } },
        ]);
      } else {
        rows = await GameQuestionModel
          .find(match)
          .select("text options correctAnswer gameId")
          .lean();
      }

      out.code = 200;
      out.message = "find success";
      out.body = rows as any;
      return out;
    } catch {
      out.code = 500; out.message = "server error"; return out;
    }
  }
}
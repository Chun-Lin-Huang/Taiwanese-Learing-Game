import { Types } from "mongoose";
import { GameModel } from "../orm/schemas/gameSchemas";
import type { Game } from "../interfaces/Game";
import type { resp } from "../utils/resp";
import type { DBResp } from "../interfaces/DBResp";

export class GameService {
  /** 取該分類最新一筆遊戲（開始遊戲會用） */
  async getLatestByCategoryId(categoryId: string): Promise<resp<DBResp<Game> | undefined>> {
    const out: resp<DBResp<Game> | undefined> = { code: 200, message: "", body: undefined };
    try {
      if (!Types.ObjectId.isValid(categoryId)) {
        out.code = 400; out.message = "invalid categoryId"; return out;
      }
      const row = await GameModel.findOne({ categoryId: new Types.ObjectId(categoryId) })
        .sort({ createdAt: -1 })
        .lean();
      if (!row) { out.code = 404; out.message = "game not found"; return out; }

      out.code = 200; out.message = "find success"; out.body = row as any;
      return out;
    } catch {
      out.code = 500; out.message = "server error"; return out;
    }
  }
}
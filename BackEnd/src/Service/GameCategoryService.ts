// src/Service/GameCategoryService.ts
import { GameCategoryModel } from "../orm/schemas/gameCategorySchemas";
import type { resp } from "../utils/resp";
import type { DBResp } from "../interfaces/DBResp";
import type { GameCategories } from "../interfaces/GameCategories";

export class GameCategoryService {
  /**
   * 依名稱查 categoryId（回傳 { id }）
   * @param name 類別名稱（前端顯示的文字）
   * @returns resp<{ id: string } | undefined>
   */
  public async getIdByName(name: string): Promise<resp<{ id: string } | undefined>> {
    const out: resp<{ id: string } | undefined> = { code: 200, message: "", body: undefined };

    try {
      const n = (name ?? "").trim();
      if (!n) {
        out.code = 400;
        out.message = "缺少 name 參數";
        return out;
      }

      // 先做精準比對；找不到再做大小寫不敏感比對
      let doc: DBResp<GameCategories> | null = await GameCategoryModel
        .findOne({ name: n, isActive: true })
        .lean();

      if (!doc) {
        doc = await GameCategoryModel
          .findOne({
            name: { $regex: `^${escapeRegex(n)}$`, $options: "i" },
            isActive: true,
          })
          .lean() as DBResp<GameCategories> | null;
      }

      if (!doc?._id) {
        out.code = 404;
        out.message = "找不到該遊戲類別";
        return out;
      }

      out.code = 200;
      out.message = "ok";
      out.body = { id: String(doc._id) };
      return out;
    } catch {
      out.code = 500;
      out.message = "server error";
      return out;
    }
  }
}

/** 簡單正則跳脫，避免名稱中有特殊字元時誤判 */
function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
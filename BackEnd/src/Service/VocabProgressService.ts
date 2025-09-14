// src/Service/VocabProgressService.ts
import { VocabProgressModel } from "../orm/schemas/vocabProgressSchemas";
import type { resp } from "../utils/resp";
import type { VocabProgress } from "../interfaces/VocabProgress";

export class VocabProgressService {
  /** 讀取進度 */
  async getProgress(userId: string, categoryId: string): Promise<resp<{ currentIndex: number }>> {
    const out: resp<{ currentIndex: number }> = { code: 200, message: "", body: { currentIndex: 0 } };
    try {
      if (!userId || !categoryId) {
        out.code = 400; out.message = "userId & categoryId required"; return out;
      }
      const doc = await VocabProgressModel.findOne({ userId, categoryId }).lean();
      out.body = { currentIndex: doc?.currentIndex ?? 0 };
      out.message = "find success";
      return out;
    } catch {
      out.code = 500; out.message = "server error"; return out;
    }
  }

  /** 更新/儲存進度（upsert） */
  async updateProgress(payload: { userId: string; categoryId: string; currentIndex: number })
    : Promise<resp<{ success: true; currentIndex: number }>> {
    const out: resp<{ success: true; currentIndex: number }> =
      { code: 200, message: "", body: { success: true, currentIndex: 0 } };

    try {
      const userId = String(payload.userId || "").trim();
      const categoryId = String(payload.categoryId || "").trim();
      let currentIndex = Number(payload.currentIndex);

      if (!userId || !categoryId || !Number.isFinite(currentIndex)) {
        out.code = 400; out.message = "userId / categoryId / currentIndex required"; return out;
      }
      if (currentIndex < 0) currentIndex = 0;

      const updated = await VocabProgressModel.findOneAndUpdate(
        { userId, categoryId },
        { $set: { currentIndex } },
        { new: true, upsert: true }
      ).lean();

      out.body = { success: true, currentIndex: updated!.currentIndex };
      out.message = "update success";
      return out;
    } catch (e: any) {
      // 如果 unique index 衝突，再重試一次（避免並發寫入）
      if (e?.code === 11000) {
        const doc = await VocabProgressModel.findOne({ userId: payload.userId, categoryId: payload.categoryId }).lean();
        const currentIndex = Math.max(0, Number(payload.currentIndex || 0));
        const updated = await VocabProgressModel.findByIdAndUpdate(
          doc?._id, { $set: { currentIndex } }, { new: true }
        ).lean();
        return { code: 200, message: "update success", body: { success: true, currentIndex: updated!.currentIndex } };
      }
      return { code: 500, message: "server error", body: { success: true, currentIndex: 0 } };
    }
  }

}
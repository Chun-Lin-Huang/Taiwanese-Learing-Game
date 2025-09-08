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

  /** 獲取用戶所有學習進度 */
  async getAllProgressByUser(userId: string): Promise<resp<Array<{
    categoryId: string;
    categoryTitle?: string;
    currentIndex: number;
    total?: number;
    updatedAt?: Date;
  }>>> {
    const out: resp<Array<{
      categoryId: string;
      categoryTitle?: string;
      currentIndex: number;
      total?: number;
      updatedAt?: Date;
    }>> = { code: 200, message: "", body: [] };
    
    try {
      if (!userId) {
        out.code = 400; 
        out.message = "userId required"; 
        return out;
      }
      
      const docs = await VocabProgressModel.find({ userId })
        .sort({ updatedAt: -1 })
        .lean();
      
      // 獲取分類信息
      const { VocabularyCategoryModel } = await import("../orm/schemas/vocabularyCategorySchemas");
      const { VocabularyCardModel } = await import("../orm/schemas/vocabularyCardSchemas");
      
      const progressWithDetails = await Promise.all(
        docs.map(async (doc) => {
          try {
            // 獲取分類標題
            const category = await VocabularyCategoryModel.findById(doc.categoryId).lean();
            const categoryTitle = category?.name || '未知分類';
            
            // 獲取該分類的總卡片數
            const totalCards = await VocabularyCardModel.countDocuments({ 
              category_id: doc.categoryId 
            });
            
            return {
              categoryId: doc.categoryId,
              categoryTitle,
              currentIndex: doc.currentIndex,
              total: totalCards,
              updatedAt: doc.updatedAt
            };
          } catch {
            return {
              categoryId: doc.categoryId,
              categoryTitle: '未知分類',
              currentIndex: doc.currentIndex,
              total: 0,
              updatedAt: doc.updatedAt
            };
          }
        })
      );
      
      out.body = progressWithDetails;
      out.message = "find all progress success";
      return out;
    } catch {
      out.code = 500; 
      out.message = "server error"; 
      return out;
    }
  }
}
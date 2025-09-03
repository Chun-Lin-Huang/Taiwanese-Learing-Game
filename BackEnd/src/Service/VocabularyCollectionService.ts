// src/Service/VocabularyCollectionService.ts
import { Types } from "mongoose";
import { VocabularyCollectionModel } from "../orm/schemas/vocabularyCollectionSchemas";
import type { resp } from "../utils/resp";

function toObjectId(id: string) {
  if (!id || !Types.ObjectId.isValid(id)) return null;
  return new Types.ObjectId(id);
}

export class VocabularyCollectionService {
  /** 列出使用者的收藏 */
  async list(userId: string): Promise<
    resp<Array<{ cardId: string; han?: string; tl?: string; ch?: string; addedAt?: Date }>>
  > {
    const userObjId = toObjectId(userId);
    if (!userObjId) return { code: 400, message: "userId invalid", body: [] };

    const doc = await VocabularyCollectionModel
      .findOne({ user_id: userObjId })
      .select("vocabulary")
      .lean();

    const body =
      doc?.vocabulary?.map((v: any) => ({
        cardId: String(v.id),
        han: v.han,
        tl: v.tl,
        ch: v.ch,
        addedAt: v.addedAt,
      })) ?? [];

    return { code: 200, message: "find success", body };
  }

  /** 是否已收藏 */
  async has(userId: string, cardId: string): Promise<resp<{ has: boolean }>> {
    const userObjId = toObjectId(userId);
    const cardObjId = toObjectId(cardId);
    if (!userObjId || !cardObjId) {
      return { code: 400, message: "userId/cardId invalid", body: { has: false } };
    }

    const exists = await VocabularyCollectionModel.exists({
      user_id: userObjId,
      "vocabulary.id": cardObjId,
    });

    return { code: 200, message: "ok", body: { has: !!exists } };
  }

  /** 新增收藏（若不存在才加入） */
  async add(userId: string, cardId: string, meta?: { han?: string; tl?: string; ch?: string })
    : Promise<resp<null>> {
    const userObjId = toObjectId(userId);
    const cardObjId = toObjectId(cardId);
    if (!userObjId || !cardObjId) {
      return { code: 400, message: "userId/cardId invalid", body: null };
    }

    // 僅在該卡尚未存在時才 push；若文件不存在，順便建立
    const result = await VocabularyCollectionModel.updateOne(
      { user_id: userObjId, "vocabulary.id": { $ne: cardObjId } },
      {
        $push: {
          vocabulary: {
            id: cardObjId,
            han: meta?.han,
            tl: meta?.tl,
            ch: meta?.ch,
            addedAt: new Date(),
          },
        },
        $setOnInsert: { user_id: userObjId, addTime: new Date() },
      },
      { upsert: true }
    );

    const modified = (result.modifiedCount ?? 0) > 0 || (result.upsertedCount ?? 0) > 0;
    return {
      code: 200,
      message: modified ? "added" : "already exists",
      body: null,
    };
  }

  /** 移除收藏（若存在則刪） */
  async remove(userId: string, cardId: string): Promise<resp<null>> {
    const userObjId = toObjectId(userId);
    const cardObjId = toObjectId(cardId);
    if (!userObjId || !cardObjId) {
      return { code: 400, message: "userId/cardId invalid", body: null };
    }

    const result = await VocabularyCollectionModel.updateOne(
      { user_id: userObjId },
      { $pull: { vocabulary: { id: cardObjId } } }
    );

    const changed = (result.modifiedCount ?? 0) > 0;
    return { code: 200, message: changed ? "removed" : "not found", body: null };
  }

  /** 反轉收藏狀態：有就刪、沒有就加 */
  async toggle(userId: string, cardId: string, meta?: { han?: string; tl?: string; ch?: string })
    : Promise<resp<{ now: "added" | "removed" }>> {
    const has = await this.has(userId, cardId);
    if (has.code !== 200) return { code: has.code, message: has.message, body: { now: "removed" } };

    if (has.body.has) {
      const r = await this.remove(userId, cardId);
      return { code: r.code, message: r.message, body: { now: "removed" } };
    } else {
      const r = await this.add(userId, cardId, meta);
      return { code: r.code, message: r.message, body: { now: "added" } };
    }
  }
}
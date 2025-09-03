// src/Service/VocabularyCardService.ts
import { Types } from "mongoose";
import { VocabularyCardModel } from "../orm/schemas/vocabularyCardSchemas";
import { VocabularyAudioModel } from "../orm/schemas/vocabularyAudioSchemas";
import type { resp } from "../utils/resp";

export class VocabularyCardService {
  private readonly baseUrl = process.env.BASE_URL || "http://127.0.0.1:2083";
  private streamByDocId = (docId: string) =>
    `${this.baseUrl}/api/v1/vocab-audio/stream/${docId}`;
  private streamByCardId = (cardId: string) =>
    `${this.baseUrl}/api/v1/vocab-audio/stream-by-card/${cardId}`;

  async listByCategory(categoryId: string): Promise<resp<any[]>> {
    if (!categoryId) return { code: 400, message: "categoryId required", body: [] };

    const cards = await VocabularyCardModel.find({ category_id: categoryId })
      .select("_id han tl ch category_id audio_file_id audio_filename")
      .sort({ han: 1 })
      .lean();

    if (!cards.length) return { code: 200, message: "find success", body: [] };

    // 以 vocId（= card._id）去 VocabularyAudio 找
    const cardIds = cards.map(c => String(c._id));
    const vocIdObj = cardIds
      .map(s => (Types.ObjectId.isValid(s) ? new Types.ObjectId(s) : null))
      .filter(Boolean) as Types.ObjectId[];

    const audios = await VocabularyAudioModel.find({
      isActive: { $ne: false },
      vocId: { $in: [...vocIdObj, ...cardIds] }, // 兼容 DB 可能存 objId 或 string
    })
      .select("_id vocId")
      .lean();

    const mapVocIdToAudioDocId = new Map<string, string>();
    for (const a of audios) mapVocIdToAudioDocId.set(String((a as any).vocId), String(a._id));

    const body = cards.map(c => {
      const cardId = String(c._id);
      const audioDocId = mapVocIdToAudioDocId.get(cardId) || null;

      return {
        _id: cardId,
        han: c.han,
        tl: c.tl,
        ch: c.ch,
        categoryId: String(c.category_id),
        audioFilename: c.audio_filename || null,
        audioId: audioDocId,
        audioUrl: audioDocId ? this.streamByDocId(audioDocId) : this.streamByCardId(cardId),
      };
    });

    return { code: 200, message: "find success", body };
  }

  /** 根據 cardId 取得單字卡詳細內容（含音檔資訊） */
  async getById(cardId: string): Promise<resp<any>> {
    if (!Types.ObjectId.isValid(cardId)) {
      return { code: 400, message: "cardId invalid", body: null };
    }

    // 1) 單字卡
    const card = await VocabularyCardModel.findById(cardId)
      .select("_id han tl ch category_id audio_file_id audio_filename")
      .lean();

    if (!card) return { code: 404, message: "not found", body: null };

    // 2) 音檔：相容三種情況
    //   - 新資料：vocId=ObjectId(cardId)
    //   - 新資料（有些存字串）：vocId=cardId(string)
    //   - 舊資料：audioFileId = card.audio_file_id
    const vocIdObj = new Types.ObjectId(cardId);
    const audio = await VocabularyAudioModel.findOne({
      isActive: { $ne: false },
      $or: [
        { vocId: vocIdObj },
        { vocId: cardId },
        ...(card.audio_file_id ? [{ audioFileId: String(card.audio_file_id) }] : []),
      ],
    })
      .select("_id")
      .lean();

    const audioDocId = audio ? String(audio._id) : null;

    // 3) 組回傳：若找不到 audioDocId，就提供以 cardId 串流的備援路徑
    const audioUrl = audioDocId
      ? this.streamByDocId(audioDocId)
      : this.streamByCardId(String(card._id));

    return {
      code: 200,
      message: "find success",
      body: {
        _id: String(card._id),
        han: card.han,
        tl: card.tl,
        ch: card.ch,
        categoryId: String(card.category_id),
        audioFileId: card.audio_file_id ? String(card.audio_file_id) : null,
        audioId: audioDocId,
        audioFilename: card.audio_filename || null,
        audioUrl,
      },
    };
  }
}
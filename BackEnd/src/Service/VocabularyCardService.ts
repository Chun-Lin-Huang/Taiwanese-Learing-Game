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
}
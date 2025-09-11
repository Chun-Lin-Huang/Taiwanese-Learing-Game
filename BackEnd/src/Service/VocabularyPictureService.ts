// src/Service/VocabularyPictureService.ts
import { Types } from "mongoose";
import { VocabularyPictureModel } from "../orm/schemas/vocabularyPictureSchemas";
import { VocabularyCardModel } from "../orm/schemas/vocabularyCardSchemas";
import { VocabularyAudioModel } from "../orm/schemas/vocabularyAudioSchemas";
import type { resp } from "../utils/resp";

export class VocabularyPictureService {
  private readonly baseUrl = process.env.BASE_URL || "http://127.0.0.1:2083";

  private makeImageUrl(id: string) {
    return `${this.baseUrl}/api/v1/vocabulary-pictures/stream/${id}`;
  }

  private streamByDocId = (docId: string) =>
    `${this.baseUrl}/api/v1/vocab-audio/stream/${docId}`;
  private streamByCardId = (cardId: string) =>
    `${this.baseUrl}/api/v1/vocab-audio/stream-by-card/${cardId}`;

  /** 根據分類取得所有圖片總覽（含音檔資訊） */
  async listByCategory(categoryId: string): Promise<resp<any[]>> {
    try {
      if (!categoryId) return { code: 400, message: "categoryId required", body: [] };

      console.log('VocabularyPictureService.listByCategory - categoryId:', categoryId);

      // 1) 先取得該分類的所有單字卡
      const cards = await VocabularyCardModel.find({ category_id: categoryId })
        .select("_id han tl ch")
        .lean();

      console.log('VocabularyPictureService.listByCategory - cards found:', cards.length);

      if (!cards.length) return { code: 200, message: "find success", body: [] };

    const cardIds = cards.map(c => String(c._id));
    const vocIdObj = cardIds
      .map(s => (Types.ObjectId.isValid(s) ? new Types.ObjectId(s) : null))
      .filter(Boolean) as Types.ObjectId[];

    // 2) 取得對應的圖片
    const pictures = await VocabularyPictureModel.find({
      vocId: { $in: vocIdObj }
    })
      .select("_id imageFileName imageSize imageType vocId")
      .lean();

    // 3) 取得對應的音檔
    const audios = await VocabularyAudioModel.find({
      isActive: { $ne: false },
      vocId: { $in: [...vocIdObj, ...cardIds] },
    })
      .select("_id vocId")
      .lean();

    const mapVocIdToAudioDocId = new Map<string, string>();
    for (const a of audios) mapVocIdToAudioDocId.set(String((a as any).vocId), String(a._id));

    // 4) 組合回傳資料
    const body = pictures.map(p => {
      const cardId = String(p.vocId);
      const card = cards.find(c => String(c._id) === cardId);
      const audioDocId = mapVocIdToAudioDocId.get(cardId) || null;

      return {
        _id: String(p._id),
        imageFileName: p.imageFileName,
        imageSize: p.imageSize,
        imageType: p.imageType,
        imageUrl: this.makeImageUrl(String(p._id)),
        vocId: cardId,
        audioId: audioDocId,
        audioUrl: audioDocId ? this.streamByDocId(audioDocId) : this.streamByCardId(cardId),
        // 單字卡基本資訊
        han: card?.han || "",
        tl: card?.tl || "",
        ch: card?.ch || "",
      };
    });

      return { code: 200, message: "find success", body };
    } catch (error) {
      console.error('VocabularyPictureService.listByCategory - error:', error);
      return { code: 500, message: "server error", body: [] };
    }
  }

  /** 根據圖片ID取得單一圖片檔案（串流用） */
  async getById(id: string): Promise<{
    image: Buffer;
    imageType: string;
    imageSize: number;
    imageFileName: string;
  } | null> {
    if (!Types.ObjectId.isValid(id)) return null;

    const picture = await VocabularyPictureModel.findById(id)
      .select("image imageType imageSize imageFileName")
      .lean();

    if (!picture) return null;

    return {
      image: picture.image,
      imageType: picture.imageType,
      imageSize: picture.imageSize,
      imageFileName: picture.imageFileName,
    };
  }

  /** 根據單字卡ID取得對應圖片 */
  async getByCardId(cardId: string): Promise<resp<any>> {
    if (!Types.ObjectId.isValid(cardId)) {
      return { code: 400, message: "cardId invalid", body: null };
    }

    const picture = await VocabularyPictureModel.findOne({
      vocId: new Types.ObjectId(cardId)
    })
      .select("_id imageFileName imageSize imageType vocId")
      .lean();

    if (!picture) return { code: 404, message: "not found", body: null };

    return {
      code: 200,
      message: "find success",
      body: {
        _id: String(picture._id),
        imageFileName: picture.imageFileName,
        imageSize: picture.imageSize,
        imageType: picture.imageType,
        imageUrl: this.makeImageUrl(String(picture._id)),
        vocId: String(picture.vocId),
      },
    };
  }
}

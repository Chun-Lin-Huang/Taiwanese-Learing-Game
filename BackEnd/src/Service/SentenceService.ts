// src/Service/SentenceService.ts
import { SentenceModel } from "../orm/schemas/sentenceSchemas";
import type { resp } from "../utils/resp";

export class SentenceService {
  private readonly baseUrl = process.env.BASE_URL || "http://127.0.0.1:2083";

  /** 依例句音檔 Id 組完整串流網址 */
  private makeAudioUrl(audioId: string | null) {
    return audioId ? `${this.baseUrl}/api/v1/sentence-audio/stream/${audioId}` : null;
  }

  /** 依單字卡 cardId 取得該卡的所有例句（含可直接播放的 audioUrl） */
  async listByCard(cardId: string): Promise<
    resp<Array<{
      _id: string;
      chinese: string;
      han: string;
      tl: string;
      audioId: string | null;
      audioFilename: string | null;
      audioUrl: string | null;
    }>>
  > {
    if (!cardId || !String(cardId).trim()) {
      return { code: 400, message: "cardId required", body: [] };
    }

    const rows = await SentenceModel.find({
      cardId: String(cardId),         // ★ 用字串比對
      isActive: { $ne: false },       // ★ 只取有效資料
    })
      .select("_id chinese han tl audioFileId audioFilename")
      .sort({ _id: 1 })
      .lean();

    const body = rows.map((r: any) => {
      const audioId = r.audioFileId ? String(r.audioFileId) : null;
      return {
        _id: String(r._id),
        chinese: r.chinese,
        han: r.han,
        tl: r.tl,
        audioId,
        audioFilename: r.audioFilename || null,
        audioUrl: this.makeAudioUrl(audioId),
      };
    });

    return { code: 200, message: "find success", body };
  }
}
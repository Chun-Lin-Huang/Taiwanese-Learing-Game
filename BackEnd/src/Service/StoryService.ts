// src/Service/StoryService.ts
import { StoryNameModel } from "../orm/schemas/storyNameSchemas";
import { StoryModel } from "../orm/schemas/storySchemas";
import { StoryAudioModel } from "../orm/schemas/storyAudioSchemas";
import type { resp } from "../utils/resp";

export class StoryService {
  private readonly baseUrl = process.env.BASE_URL || "http://127.0.0.1:2083";

  /** 取得故事清單 */
  async list(): Promise<resp<any[]>> {
    const out: resp<any[]> = { code: 200, message: "", body: [] };
    try {
      const rows = await StoryNameModel.find()
        .select("_id name imageFilename")
        .lean();

      out.body = rows.map(r => ({
        ...r,
        imageUrl: r.imageFilename
          ? `${this.baseUrl}/api/v1/story-name/stream/${r._id}`
          : null,
      }));
      out.message = "find success";
      return out;
    } catch {
      return { code: 500, message: "server error", body: [] };
    }
  }

  /** 關鍵字搜尋故事 */
  async search(keyword: string): Promise<resp<any[]>> {
    const out: resp<any[]> = { code: 200, message: "", body: [] };
    try {
      const q = keyword?.trim()
        ? { name: { $regex: keyword.trim(), $options: "i" } }
        : {};
      const rows = await StoryNameModel.find(q)
        .select("_id name imageFilename")
        .lean();

      out.body = rows.map(r => ({
        ...r,
        imageUrl: r.imageFilename
          ? `${this.baseUrl}/api/v1/story-name/stream/${r._id}`
          : null,
      }));
      out.message = "find success";
      return out;
    } catch {
      return { code: 500, message: "server error", body: [] };
    }
  }

  /** 取得單一故事內容（含 imageUrl） */
  async getStoryDetail(storyNameId: string): Promise<resp<any>> {
    const out: resp<any> = { code: 200, message: "", body: null };
    try {
      if (!storyNameId) {
        return { code: 400, message: "storyNameId required", body: null };
      }

      const story = await StoryModel.findOne({ storyNameId })
        .select("_id storyNameId chinese han audioId imageFilename")
        .lean();

      if (!story) return { code: 404, message: "not found", body: null };

      out.body = {
        ...story,
        imageUrl: story.imageFilename
          ? `${this.baseUrl}/api/v1/story-name/stream/${story.storyNameId}`
          : null,
      };
      out.message = "find success";
      return out;
    } catch {
      return { code: 500, message: "server error", body: null };
    }
  }

  /** 取得音檔播放資訊（回可播放 URL） */
  async getAudioMeta(audioId: string): Promise<resp<any>> {
    const out: resp<any> = { code: 200, message: "", body: null };
    try {
      if (!audioId) {
        return { code: 400, message: "audioId required", body: null };
      }

      const audio = await StoryAudioModel.findById(audioId)
        .select("_id originalFilename fileSize duration audioType")
        .lean();

      if (!audio) return { code: 404, message: "not found", body: null };

      out.body = {
        ...audio,
        url: `${this.baseUrl}/api/v1/story-audio/stream/${audio._id}`,
      };
      out.message = "find success";
      return out;
    } catch {
      return { code: 500, message: "server error", body: null };
    }
  }
}
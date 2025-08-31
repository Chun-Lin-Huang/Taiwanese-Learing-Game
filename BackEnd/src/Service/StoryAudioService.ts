// src/Service/StoryAudioService.ts
import { StoryNameModel } from "../orm/schemas/storyNameSchemas";
import { StoryAudioModel } from "../orm/schemas/storyAudioSchemas";
import type { resp } from "../utils/resp";

export class StoryAudioService {
  private readonly baseUrl = process.env.BASE_URL || "http://127.0.0.1:2083";

  private makeStreamUrl(id: string) {
    return `${this.baseUrl}/api/v1/story-audio/stream/${id}`;
  }

  /** 把來自 Mongo 的 Binary/Buffer 轉成 Node Buffer */
  private toNodeBuffer(bin: unknown): Buffer | null {
    if (!bin) return null;
    if (Buffer.isBuffer(bin)) return bin;
    // bson Binary 物件 { buffer: Buffer }
    // @ts-ignore
    if ((bin as any)?.buffer && Buffer.isBuffer((bin as any).buffer)) {
      // @ts-ignore
      return (bin as any).buffer as Buffer;
    }
    // 可能是 { type:'Buffer', data:number[] }
    // @ts-ignore
    if ((bin as any)?.type === "Buffer" && Array.isArray((bin as any).data)) {
      // @ts-ignore
      return Buffer.from((bin as any).data as number[]);
    }
    return null;
  }

  /** 依「StoryName 的 _id」找音檔（你的邏輯：用故事名稱對應） */
  async getByStoryNameId(storyNameId: string): Promise<resp<any>> {
    if (!storyNameId) return { code: 400, message: "storyNameId required", body: null };

    // 1) 找故事名稱
    const storyNameDoc = await StoryNameModel.findById(storyNameId).select("name").lean();
    if (!storyNameDoc?.name) return { code: 404, message: "story name not found", body: null };

    // 2) 用 name 對應 StoryAudio.storyName
    const audio = await StoryAudioModel.findOne({ storyName: storyNameDoc.name, isActive: true })
      .select("_id originalFilename duration audioType fileSize")
      .lean();

    if (!audio) return { code: 404, message: "audio not found", body: null };

    // 3) 回 stream URL（給前端 <audio> 用）
    return {
      code: 200,
      message: "find success",
      body: {
        _id: String(audio._id),
        originalFilename: audio.originalFilename,
        audioType: audio.audioType,
        fileSize: audio.fileSize,
        duration: audio.duration,
        url: this.makeStreamUrl(String(audio._id)),
      },
    };
  }

  /** 串流用：依音檔 _id 取出 buffer + meta（Controller.stream 會用） */
  async findById(id: string): Promise<{
    audioData: Buffer | null;
    contentType: string;
    fileSize: number;
  } | null> {
    // 不用 .lean()：也可以；若用 .lean() 也 OK，但要做轉 Buffer
    const doc = await StoryAudioModel.findById(id)
      .select("audioData contentType fileSize")
      .lean();

    if (!doc) return null;

    const buf = this.toNodeBuffer((doc as any).audioData);
    if (!buf) return null;

    return {
      audioData: buf,
      contentType: (doc as any).contentType || "audio/wav",
      fileSize: (doc as any).fileSize ?? buf.length,
    };
  }
}
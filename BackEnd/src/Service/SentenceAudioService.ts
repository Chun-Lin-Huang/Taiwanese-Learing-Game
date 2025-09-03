import { Types } from "mongoose";
import { SentenceAudioModel } from "../orm/schemas/sentenceAudioSchemas";

/** 將 BSON Binary / Buffer 轉成 Node.js Buffer */
function toNodeBuffer(bin: unknown): Buffer | null {
  if (!bin) return null;
  if (Buffer.isBuffer(bin)) return bin;
  // mongoose BSON Binary 格式 { buffer: <Buffer> }
  // @ts-ignore
  if (bin?.buffer && Buffer.isBuffer((bin as any).buffer)) {
    // @ts-ignore
    return (bin as any).buffer as Buffer;
  }
  // { type:'Buffer', data:number[] }
  // @ts-ignore
  if ((bin as any)?.type === "Buffer" && Array.isArray((bin as any).data)) {
    // @ts-ignore
    return Buffer.from((bin as any).data as number[]);
  }
  return null;
}

export class SentenceAudioService {
  /**
   * 取例句音檔的原始資料（給 Controller 串流）
   * 回傳：buf（Buffer）、type（MIME）、size（長度）
   */
  async getAudioForStream(audioId: string): Promise<{
    buf: Buffer | null;
    type: string;
    size: number;
  }> {
    if (!audioId || !Types.ObjectId.isValid(audioId)) {
      return { buf: null, type: "audio/wav", size: 0 };
    }

    const doc = await SentenceAudioModel.findById(audioId)
      .select("audioData contentType fileSize isActive")
      .lean();

    if (!doc || (doc as any).isActive === false) {
      return { buf: null, type: "audio/wav", size: 0 };
    }

    const buf = toNodeBuffer((doc as any).audioData);
    const type = (doc as any).contentType || "audio/wav";
    const size = buf ? buf.length : Number((doc as any).fileSize) || 0;

    return { buf, type, size };
  }
}
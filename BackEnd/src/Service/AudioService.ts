// src/Service/AudioService.ts
import { Types } from "mongoose"; // ← 若完全沒用到，也可移除
import path from "path";
import fs from "fs";
import os from "os";

import { GameAudioModel } from "../orm/schemas/gameAudioSchemas";
import type { GameAudio } from "../interfaces/GameAudio";
import type { resp } from "../utils/resp";
import type { DBResp } from "../interfaces/DBResp";

export class AudioService {
  private readonly cacheDir = path.resolve(process.cwd(), "uploads/audio.cache");
  private readonly publicStreamPath = "/api/v1/audio/stream/";

  constructor() {
    this.ensureDir(this.cacheDir);
  }

  private ensureDir(dir: string) {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  }

  private buildPublicUrl(idOrFileId: string) {
    const base = process.env.BASE_URL || "http://127.0.0.1:2083";
    return `${base}${this.publicStreamPath}${idOrFileId}`;
  }

  private toSafeFilePath(fileName: string) {
    const fp = path.resolve(this.cacheDir, fileName);
    if (!fp.startsWith(this.cacheDir)) throw new Error("unsafe path");
    return fp;
  }

  private toNodeBuffer(bin: unknown): Buffer | null {
    if (!bin) return null;
    if (Buffer.isBuffer(bin)) return bin;
    // mongoose 的 BSON Binary: { buffer: Buffer }
    // @ts-ignore
    if ((bin as any)?.buffer && Buffer.isBuffer((bin as any).buffer)) {
      // @ts-ignore
      return (bin as any).buffer as Buffer;
    }
    // { type: 'Buffer', data: [...] }
    // @ts-ignore
    if ((bin as any)?.type === "Buffer" && Array.isArray((bin as any).data)) {
      // @ts-ignore
      return Buffer.from((bin as any).data as number[]);
    }
    return null;
  }

  /** ① 依 questionId 取得音檔（回傳含可播 URL） */
  async getByQuestion(
    questionId: string
  ): Promise<resp<DBResp<GameAudio>[] | undefined>> {
    const out: resp<DBResp<GameAudio>[] | undefined> = {
      code: 200,
      message: "",
      body: undefined,
    };
    try {
      if (!questionId) {
        out.code = 400;
        out.message = "questionId required";
        return out;
      }

      // ⚠️ 你的 DB 裡 questionId 是「字串」，不要轉 ObjectId
      const rows = await GameAudioModel.find({
        questionId,            // ← 用字串直接比對
        isActive: true,
      })
        .select("_id gameCategoryId questionId originalFilename audioType fileSize duration isActive")
        .lean();

      const withUrl = (rows || []).map((r: any) => ({
        ...r,
        url: this.buildPublicUrl(String(r._id)),
      })) as any;

      out.code = 200;
      out.message = "find success";
      out.body = withUrl;
      return out;
    } catch {
      out.code = 500;
      out.message = "server error";
      return out;
    }
  }

  /** ② 依音檔文件 _id 取得本機可串流的檔案路徑（快取到本機檔案） */
  async getFilePathByDocId(audioId: string): Promise<string | null> {
    if (!audioId) return null;

    const doc = await GameAudioModel.findById(audioId)
      .select("originalFilename audioData")
      .lean();

    if (!doc) return null;

    const ext =
      (doc as any).originalFilename && path.extname((doc as any).originalFilename)
        ? path.extname((doc as any).originalFilename)
        : ".bin";

    const fileName = `${audioId}${ext}`;
    const filePath = this.toSafeFilePath(fileName);

    if (fs.existsSync(filePath)) return filePath;

    const buf = this.toNodeBuffer((doc as any).audioData);
    if (!buf) return null;

    fs.writeFileSync(filePath, buf);
    return filePath;
  }
}
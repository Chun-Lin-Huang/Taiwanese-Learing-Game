// src/controller/AudioController.ts
import { Contorller } from "../abstract/Contorller";
import { Request, Response } from "express";
import { AudioService } from "../Service/AudioService";
import path from "path";
import fs from "fs";

export class AudioController extends Contorller {
  protected service: AudioService;

  constructor() {
    super();
    this.service = new AudioService();
  }

  /**
   * ① 依 questionId 取得音檔（回傳含可播 URL）
   * GET /api/v1/audio/by-question/:questionId
   */
  public async byQuestion(req: Request, res: Response) {
    const { questionId } = req.params;
    if (!questionId) {
      return res.status(400).json({ code: 400, message: "questionId required" });
    }

    const result = await this.service.getByQuestion(questionId);
    return res.status(result.code).json(result);
  }

  /**
   * ② 串流播放音檔（支援 Range）
   * GET /api/v1/audio/stream/:audioId
   */
  public async stream(req: Request, res: Response) {
    try {
      const { audioId } = req.params;
      if (!audioId) {
        return res.status(400).json({ code: 400, message: "audioId required" });
      }

      const filePath = await this.service.getFilePathByDocId(audioId);
      if (!filePath) {
        return res.status(404).json({ code: 404, message: "audio file not found" });
      }

      // 推斷 Content-Type
      const ext = path.extname(filePath).toLowerCase();
      const contentType =
        ext === ".mp3" ? "audio/mpeg" :
        ext === ".wav" ? "audio/wav" :
        ext === ".ogg" ? "audio/ogg" :
        ext === ".m4a" ? "audio/mp4" : "application/octet-stream";

      const stat = fs.statSync(filePath);
      const total = stat.size;
      const range = req.headers.range;

      if (range) {
        // 206 Partial Content
        const [startStr, endStr] = range.replace(/bytes=/, "").split("-");
        const start = parseInt(startStr, 10);
        const end = endStr ? parseInt(endStr, 10) : total - 1;

        if (Number.isNaN(start) || Number.isNaN(end) || start >= total || end >= total || start > end) {
          return res.status(416).set("Content-Range", `bytes */${total}`).end();
        }

        const chunkSize = end - start + 1;
        res.writeHead(206, {
          "Content-Range": `bytes ${start}-${end}/${total}`,
          "Accept-Ranges": "bytes",
          "Content-Length": chunkSize,
          "Content-Type": contentType,
        });
        fs.createReadStream(filePath, { start, end }).pipe(res);
      } else {
        // 200 OK (完整檔案)
        res.writeHead(200, {
          "Content-Length": total,
          "Content-Type": contentType,
          "Accept-Ranges": "bytes",
        });
        fs.createReadStream(filePath).pipe(res);
      }
    } catch (e: any) {
      return res.status(500).json({ code: 500, message: e?.message || "server error" });
    }
  }
}
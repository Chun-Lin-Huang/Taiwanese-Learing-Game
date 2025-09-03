// src/controller/VocabularyAudioController.ts
import { Request, Response } from "express";
import { VocabularyAudioService } from "../Service/VocabularyAudioService";

export class VocabularyAudioController {
  private service = new VocabularyAudioService();

  private toNodeBuffer(bin: any): Buffer | null {
    if (!bin) return null;
    if (Buffer.isBuffer(bin)) return bin;

    // BSON Binary（新版 driver）
    if (bin?._bsontype === "Binary" && typeof bin.value === "function") {
      return bin.value(true) as Buffer; // 取 raw buffer
    }

    // { buffer: <Buffer> }
    if (bin.buffer && Buffer.isBuffer(bin.buffer)) {
      return bin.buffer;
    }

    // { type: "Buffer", data: number[] }
    if (bin.type === "Buffer" && Array.isArray(bin.data)) {
      return Buffer.from(bin.data);
    }

    if (typeof bin === "string") {
      try { return Buffer.from(bin, "base64"); } catch { return null; }
    }

    return null;
  }

  /** GET /api/v1/vocab-audio/stream/:id */
  public async streamByDoc(req: Request, res: Response) {
    const { id } = req.params as { id: string };
    const doc = await this.service.getByDocId(id);
    if (!doc || (doc as any).isActive === false) {
      return res.status(404).send({ code: 404, message: "audio not found" });
    }

    const buf = this.toNodeBuffer((doc as any).audioData);
    if (!buf) {
      return res.status(404).send({ code: 404, message: "audio not found" });
    }

    res.setHeader("Content-Type", (doc as any).contentType || "audio/wav");
    res.setHeader("Content-Length", String((doc as any).fileSize || buf.length));
    return res.status(200).end(buf);
  }
}
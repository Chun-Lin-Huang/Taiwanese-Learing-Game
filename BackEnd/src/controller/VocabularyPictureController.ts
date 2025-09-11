// src/controller/VocabularyPictureController.ts
import { Request, Response } from "express";
import { VocabularyPictureService } from "../Service/VocabularyPictureService";

export class VocabularyPictureController {
  private service = new VocabularyPictureService();

  /** GET /api/v1/vocabulary-pictures/by-category/:categoryId */
  public async getByCategory(req: Request, res: Response) {
    try {
      const { categoryId } = req.params as { categoryId: string };
      const out = await this.service.listByCategory(categoryId);
      res.status(out.code).send(out);
    } catch (e) {
      console.error('VocabularyPictureController.getByCategory - error:', e);
      res.status(500).send({ code: 500, message: "server error", body: [] });
    }
  }

  /** GET /api/v1/vocabulary-pictures/stream/:id → 串流圖片 */
  public async stream(req: Request, res: Response) {
    try {
      const { id } = req.params as { id: string };
      if (!id) return res.status(400).send({ code: 400, message: "id required" });

      const doc = await this.service.getById(id);
      if (!doc || !doc.image) {
        return res.status(404).send({ code: 404, message: "image not found" });
      }

      const buf = toNodeBuffer(doc.image);
      if (!buf) return res.status(404).send({ code: 404, message: "image not found" });

      const contentType = doc.imageType || "image/png";
      res.setHeader("Content-Type", contentType);
      res.setHeader("Content-Length", String(doc.imageSize || buf.length));
      // 簡單快取（可選）
      res.setHeader("Cache-Control", "public, max-age=31536000, immutable");

      res.status(200).end(buf);
    } catch {
      res.status(500).send({ code: 500, message: "server error" });
    }
  }

  /** GET /api/v1/vocabulary-pictures/by-card/:cardId */
  public async getByCardId(req: Request, res: Response) {
    try {
      const { cardId } = req.params as { cardId: string };
      const out = await this.service.getByCardId(cardId);
      res.status(out.code).send(out);
    } catch {
      res.status(500).send({ code: 500, message: "server error", body: null });
    }
  }
}

/** 將可能的值轉成 Node Buffer：BSON Binary / Buffer / {type:'Buffer',data:[]} / Base64 字串 */
function toNodeBuffer(bin: unknown): Buffer | null {
  if (!bin) return null;
  if (Buffer.isBuffer(bin)) return bin;

  // mongoose BSON Binary: { buffer: <Buffer> }
  // @ts-ignore
  if ((bin as any)?.buffer && Buffer.isBuffer((bin as any).buffer)) {
    // @ts-ignore
    return (bin as any).buffer as Buffer;
  }

  // { type:'Buffer', data:[...] }
  // @ts-ignore
  if ((bin as any)?.type === "Buffer" && Array.isArray((bin as any).data)) {
    // @ts-ignore
    return Buffer.from((bin as any).data as number[]);
  }

  // Base64 字串
  if (typeof bin === "string") {
    try {
      return Buffer.from(bin, "base64");
    } catch {
      return null;
    }
  }

  return null;
}

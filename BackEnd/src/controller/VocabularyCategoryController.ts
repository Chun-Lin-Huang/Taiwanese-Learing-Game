// src/controller/VocabularyCategoryController.ts
import { Request, Response } from "express";
import { VocabularyCategoryService } from "../Service/VocabularyCategoryService";

export class VocabularyCategoryController {
  private service = new VocabularyCategoryService();

  /** GET /api/v1/vocab-categories/list?keyword=... */
  public async list(req: Request, res: Response) {
    try {
      const keyword = (req.query.keyword as string) || "";
      const out = await this.service.list(keyword);
      res.status(out.code).send(out);
    } catch {
      res.status(500).send({ code: 500, message: "server error", body: [] });
    }
  }

  /** GET /api/v1/vocab-categories/stream/:id → 串流圖片 */
  public async stream(req: Request, res: Response) {
    try {
      const { id } = req.params as { id: string };
      if (!id) return res.status(400).send({ code: 400, message: "id required" });

      const doc = await this.service.findById(id); // 會 select: image, imageType, imageSize
      if (!doc || !(doc as any).image) {
        return res.status(404).send({ code: 404, message: "image not found" });
      }

      const buf = toNodeBuffer((doc as any).image);
      if (!buf) return res.status(404).send({ code: 404, message: "image not found" });

      const contentType = (doc as any).imageType || "image/png";
      res.setHeader("Content-Type", contentType);
      if ((doc as any).imageSize) res.setHeader("Content-Length", String((doc as any).imageSize));
      // 簡單快取（可選）
      res.setHeader("Cache-Control", "public, max-age=31536000, immutable");

      res.status(200).end(buf);
    } catch {
      res.status(500).send({ code: 500, message: "server error" });
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
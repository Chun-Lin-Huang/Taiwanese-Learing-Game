// src/controller/StoryNameController.ts
import { Contorller } from "../abstract/Contorller";
import { Request, Response } from "express";
import { StoryNameService } from "../Service/StoryNameService";

export class StoryNameController extends Contorller {
  protected service = new StoryNameService();

  // GET /api/v1/story-name/list
  public async list(req: Request, res: Response) {
    const resp = await this.service.list({
      keyword: String(req.query.keyword || ""),
      page: Number(req.query.page || 1),
      limit: Number(req.query.limit || 20),
    });
    res.status(resp.code).send(resp);
  }

  // GET /api/v1/story-name/search?keyword=...
  public async search(req: Request, res: Response) {
    const keyword = String(req.query.keyword || "");
    const resp = await this.service.list({ keyword, page: 1, limit: 50 });
    res.status(resp.code).send(resp);
  }

  // ✅ GET /api/v1/story-name/stream/:id
  public async streamImage(req: Request, res: Response) {
    try {
      const id = String(req.params.id);
      const doc = await this.service.findById(id); // 會 select: _id name image imageFilename
      if (!doc) return res.status(404).send({ code: 404, message: "image not found" });

      // 允許 image 或 imageData 兩種欄位
      // @ts-ignore
      const bin = (doc as any).image ?? (doc as any).imageData;
      let buffer: Buffer | null = null;

      if (bin) {
        if (Buffer.isBuffer(bin)) {
          buffer = bin;
        // mongoose 的 BSON Binary 會長成 { buffer: <Buffer> }
        } else if ((bin as any).buffer && Buffer.isBuffer((bin as any).buffer)) {
          buffer = (bin as any).buffer as Buffer;
        // 有時候會被序列化成 { type: 'Buffer', data: number[] }
        } else if ((bin as any).type === "Buffer" && Array.isArray((bin as any).data)) {
          buffer = Buffer.from((bin as any).data as number[]);
        }
      }

      if (!buffer) {
        return res.status(404).send({ code: 404, message: "image not found" });
      }

      // 粗略用副檔名判斷 Content-Type
      const filename = (doc as any).imageFilename || "";
      const lowered = filename.toLowerCase();
      const isPng = lowered.endsWith(".png");
      const isJpg = lowered.endsWith(".jpg") || lowered.endsWith(".jpeg");
      res.setHeader("Content-Type", isPng ? "image/png" : isJpg ? "image/jpeg" : "application/octet-stream");
      res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
      res.send(buffer);
    } catch (e) {
      res.status(500).send({ code: 500, message: "server error" });
    }
  }
}
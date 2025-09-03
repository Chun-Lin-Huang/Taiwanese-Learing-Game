import { Request, Response } from "express";
import { SentenceAudioService } from "../Service/SentenceAudioService";

export class SentenceAudioController {
  private service = new SentenceAudioService();

  /** GET /api/v1/sentence-audio/stream/:id  */
  public async stream(req: Request, res: Response) {
    try {
      const { id } = req.params as { id: string };
      if (!id) return res.status(400).send({ code: 400, message: "id required" });

      const { buf, type, size } = await this.service.getAudioForStream(id);
      if (!buf || size <= 0) {
        return res.status(404).send({ code: 404, message: "audio not found" });
      }

      // ---- Range 支援（可被 <audio> 斷點請求）----
      const range = req.headers.range; // e.g. "bytes=0-"
      if (range) {
        // 解析 "bytes=start-end"
        const [startStr, endStr] = range.replace(/bytes=/, "").split("-");
        const start = parseInt(startStr, 10);
        const end = endStr ? parseInt(endStr, 10) : size - 1;

        if (isNaN(start) || isNaN(end) || start > end || start >= size) {
          // 不合法的 range -> 回 416
          res.setHeader("Content-Range", `bytes */${size}`);
          return res.status(416).end();
        }

        const chunk = buf.subarray(start, end + 1);

        res.status(206)
          .setHeader("Content-Type", type || "audio/wav")
          .setHeader("Content-Length", String(chunk.length))
          .setHeader("Accept-Ranges", "bytes")
          .setHeader("Content-Range", `bytes ${start}-${end}/${size}`);

        return res.end(chunk);
      }

      // ---- 無 Range：整檔回傳 ----
      res.status(200)
        .setHeader("Content-Type", type || "audio/wav")
        .setHeader("Content-Length", String(size))
        .setHeader("Accept-Ranges", "bytes");

      return res.end(buf);
    } catch (err) {
      // 避免把 Buffer 直接寫進 res.end()：一定要是 Buffer/Uint8Array
      res.status(500).send({ code: 500, message: "server error" });
    }
  }
}
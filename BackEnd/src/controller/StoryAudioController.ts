// src/controller/StoryAudioController.ts
import { Request, Response } from "express";
import { StoryAudioService } from "../Service/StoryAudioService";

export class StoryAudioController {
  public service = new StoryAudioService();

  /** 依故事名稱的 _id 取得音檔資訊（JSON，含 stream URL） */
  public async byStoryNameId(req: Request, res: Response) {
    try {
      const { storyNameId } = req.params as { storyNameId: string };
      const out = await this.service.getByStoryNameId(storyNameId);
      res.status(out.code).send(out);
    } catch (err) {
      res.status(500).send({ code: 500, message: "server error", body: null });
    }
  }

  /** 串流音檔（給 <audio> 用） */
  public async stream(req: Request, res: Response) {
    try {
      const { id } = req.params as { id: string };
      const audio = await this.service.findById(id);

      if (!audio || !audio.audioData) {
        return res.status(404).send({ code: 404, message: "audio not found" });
      }

      res.setHeader("Content-Type", audio.contentType || "audio/wav");
      res.setHeader("Content-Length", audio.fileSize);

      // 支援 HTML5 Audio 的 Range 播放
      const range = req.headers.range;
      if (range) {
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : audio.audioData.length - 1;

        res.status(206).setHeader("Content-Range", `bytes ${start}-${end}/${audio.audioData.length}`);
        res.setHeader("Accept-Ranges", "bytes");
        res.setHeader("Content-Length", end - start + 1);

        return res.end(audio.audioData.subarray(start, end + 1));
      }

      // 沒有 Range → 全部回傳
      res.end(audio.audioData);
    } catch (err) {
      res.status(500).send({ code: 500, message: "server error" });
    }
  }
}
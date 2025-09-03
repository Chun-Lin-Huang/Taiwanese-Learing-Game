import { Request, Response } from "express";
import { SentenceService } from "../Service/SentenceService";

export class SentenceController {
  private service = new SentenceService();

  /** GET /api/v1/sentences/by-card/:cardId */
  public async listByCard(req: Request, res: Response) {
    try {
      const { cardId } = req.params as { cardId: string };
      if (!cardId || !String(cardId).trim()) {
        return res.status(400).send({ code: 400, message: "cardId required", body: [] });
      }

      const out = await this.service.listByCard(String(cardId));
      return res.status(out.code).send(out);
    } catch (err) {
      console.error("[SentenceController] listByCard error:", err);
      return res.status(500).send({ code: 500, message: "server error", body: [] });
    }
  }
}
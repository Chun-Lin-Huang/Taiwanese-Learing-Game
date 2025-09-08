// src/controller/VocabProgressController.ts
import { Request, Response } from "express";
import { VocabProgressService } from "../Service/VocabProgressService";

export class VocabProgressController {
  public service = new VocabProgressService();

  /** GET /api/v1/vocab-progress/:userId/:categoryId */
  public async get(req: Request, res: Response) {
    const { userId, categoryId } = req.params as { userId: string; categoryId: string };
    const out = await this.service.getProgress(userId, categoryId);
    return res.status(out.code).send(out);
  }

  /** POST /api/v1/vocab-progress/update */
  public async update(req: Request, res: Response) {
    const { userId, categoryId, currentIndex } = req.body || {};
    const out = await this.service.updateProgress({ userId, categoryId, currentIndex });
    return res.status(out.code).send(out);
  }

  /** GET /api/v1/vocab-progress/all/:userId */
  public async getAllByUser(req: Request, res: Response) {
    const { userId } = req.params as { userId: string };
    const out = await this.service.getAllProgressByUser(userId);
    return res.status(out.code).send(out);
  }
}
// src/controller/VocabularyCardController.ts
import { Request, Response } from "express";
import { VocabularyCardService } from "../Service/VocabularyCardService";

export class VocabularyCardController {
  // 符合你抽象 Contorller 的型別需求（通常不需要 private）
  public service = new VocabularyCardService();

  /** GET /api/v1/vocab-cards/by-category/:categoryId */
  public async getByCategory(req: Request, res: Response) {
    try {
      const { categoryId } = req.params as { categoryId: string };
      const out = await this.service.listByCategory(categoryId);
      res.status(out.code).send(out);
    } catch (e) {
      res.status(500).send({ code: 500, message: "server error", body: [] });
    }
  }
}
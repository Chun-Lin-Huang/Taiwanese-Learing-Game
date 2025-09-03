// src/controller/VocabularyCollectionController.ts
import { Request, Response } from "express";
import { VocabularyCollectionService } from "../Service/VocabularyCollectionService";

export class VocabularyCollectionController {
  private service = new VocabularyCollectionService();

  /** GET /api/v1/vocab-collection/:userId */
  public list = async (req: Request, res: Response) => {
    const { userId } = req.params as { userId: string };
    const out = await this.service.list(userId);
    res.status(out.code).send(out);
  };

  /** GET /api/v1/vocab-collection/has/:userId/:cardId */
  public has = async (req: Request, res: Response) => {
    const { userId, cardId } = req.params as { userId: string; cardId: string };
    const out = await this.service.has(userId, cardId);
    res.status(out.code).send(out);
    return;
  };

  /** POST /api/v1/vocab-collection/add  { userId, cardId, han?, tl?, ch? } */
  public add = async (req: Request, res: Response) => {
    const { userId, cardId, han, tl, ch } = req.body || {};
    const out = await this.service.add(userId, cardId, { han, tl, ch });
    res.status(out.code).send(out);
  };

  /** DELETE /api/v1/vocab-collection/remove  { userId, cardId } */
  public remove = async (req: Request, res: Response) => {
    const { userId, cardId } = req.body || {};
    const out = await this.service.remove(userId, cardId);
    res.status(out.code).send(out);
  };

  /** POST /api/v1/vocab-collection/toggle  { userId, cardId, han?, tl?, ch? } */
  public toggle = async (req: Request, res: Response) => {
    const { userId, cardId, han, tl, ch } = req.body || {};
    const out = await this.service.toggle(userId, cardId, { han, tl, ch });
    res.status(out.code).send(out);
  };
}
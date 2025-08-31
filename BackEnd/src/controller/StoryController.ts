// src/controller/StoryController.ts
import { Contorller } from "../abstract/Contorller";
import { Request, Response } from "express";
import { StoryService } from "../Service/StoryService";

export class StoryController extends Contorller {
  protected service = new StoryService();

  /** GET /api/v1/story/:storyNameId */
  public async getByStoryNameId(req: Request, res: Response) {
    const { storyNameId } = req.params;
    const resp = await this.service.getStoryDetail(String(storyNameId || ""));
    return res.status(resp.code).send(resp);
  }
}
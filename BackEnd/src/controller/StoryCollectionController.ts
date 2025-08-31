import { Request, Response } from "express";
import { StoryCollectionService } from "../Service/StoryCollectionService";

export class StoryCollectionController {
  private service = new StoryCollectionService();

  // 改成 userId
  public async getByUser(req: Request, res: Response) {
    const { userId } = req.params as { userId: string };
    const out = await this.service.getByUser(userId);
    res.status(out.code).send(out);
  }

  public async addStory(req: Request, res: Response) {
    const { userId, storyNameId } = req.body;
    const out = await this.service.addStory(userId, storyNameId);
    res.status(out.code).send(out);
  }

  public async removeStory(req: Request, res: Response) {
    const { userId, storyNameId } = req.body;
    const out = await this.service.removeStory(userId, storyNameId);
    res.status(out.code).send(out);
  }
}
// src/controller/GameCategoriesController.ts
import { Contorller } from "../abstract/Contorller";
import { Request, Response } from "express";
import { GameCategoryService } from "../Service/GameCategoryService";
import { resp } from "../utils/resp";
import { DBResp } from "../interfaces/DBResp";
import { GameCategories } from "../interfaces/GameCategories";
require('dotenv').config()

export class GameCategoriesController extends Contorller {
  protected service: GameCategoryService;

  constructor() {
    super();
    this.service = new GameCategoryService();
  }

  /**
   * 依名稱查 categoryId
   * 支援：
   *   - GET /api/v1/game-categories/id-by-name?name=家用品大揭秘
   *   - 或在 Body 傳 { "name": "家用品大揭秘" }
   */
  public async getIdByName(Request: Request, Response: Response) {
    try {
      const name =
        (Request.query?.name as string | undefined)?.trim() ??
        (Request.body?.name as string | undefined)?.trim();

      if (!name) {
        return Response.status(400).send({ code: 400, message: "缺少 name 參數" });
      }

      const resp = await this.service.getIdByName(name);
      return Response.status(resp.code).send(resp);
    } catch (err: any) {
      return Response
        .status(500)
        .send({ code: 500, message: err?.message || "server error" });
    }
  }
}
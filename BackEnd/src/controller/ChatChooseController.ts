// src/controller/ChatChooseController.ts
import { Contorller } from "../abstract/Contorller";
import { Request, Response } from "express";
import { ChatChooseService } from "../Service/ChatChooseService";
import { resp } from "../utils/resp";
import { DBResp } from "../interfaces/DBResp";
import { ChatChoose } from "../interfaces/ChatChoose";
require("dotenv").config();

export class ChatChooseController extends Contorller {
  protected service: ChatChooseService;

  constructor() {
    super();
    this.service = new ChatChooseService();
  }

  /**
   * 取得全部主題清單
   * GET /api/v1/chat-choose/
   */
  public async list(Request: Request, Response: Response) {
    try {
      const resp: resp<Array<DBResp<ChatChoose>>> = await this.service.listAll();
      return Response.status(resp.code).send(resp);
    } catch (err: any) {
      return Response
        .status(500)
        .send({ code: 500, message: err?.message || "server error" });
    }
  }

  /**
   * 依 ID 取得單一主題
   * GET /api/v1/chat-choose/:id
   */
  public async getOne(Request: Request, Response: Response) {
    try {
      const id = (Request.params?.id as string | undefined)?.trim();
      if (!id) {
        return Response.status(400).send({ code: 400, message: "缺少 id 參數" });
      }

      const resp: resp<DBResp<ChatChoose> | undefined> = await this.service.getById(id);
      return Response.status(resp.code).send(resp);
    } catch (err: any) {
      return Response
        .status(500)
        .send({ code: 500, message: err?.message || "server error" });
    }
  }
}
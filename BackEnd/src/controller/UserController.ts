// src/controller/UserController.ts
import { Contorller } from "../abstract/Contorller";
import { Request, Response } from "express";
import { UserService } from "../Service/UserService";
import type { resp } from "../utils/resp";

export class UserController extends Contorller {
  protected service: UserService;

  constructor() {
    super();
    this.service = new UserService();
  }

  /** GET /api/v1/user/findAll */
  public async findAll(req: Request, res: Response) {
    const out: resp<any> = { code: 200, message: "", body: undefined };
    try {
      const rows = await this.service.getAllUsers();
      if (!rows) { out.code = 500; out.message = "server error"; return res.status(500).send(out); }
      out.code = 200; out.message = "find success"; out.body = rows;
      return res.send(out);
    } catch {
      out.code = 500; out.message = "server error";
      return res.status(500).send(out);
    }
  }

  /** POST /api/v1/user/insertOne */
  public async insertOne(req: Request, res: Response) {
    const out = await this.service.insertOne(req.body);
    return res.status(out.code).send(out);
  }

  /** POST /api/v1/user/login */
  public async login(req: Request, res: Response) {
    const out = await this.service.login(req.body);
    return res.status(out.code).send(out);
  }

  /** POST /api/v1/user/updateById */
  public async updateById(req: Request, res: Response) {
    try {
      const { _id, name, userName, password } = req.body || {};
      if (!_id) return res.status(400).json({ code: 400, message: "缺少 _id" });

      const out = await this.service.updateById(_id, { name, userName, password });
      return res.status(out.code).send(out);
    } catch (err: any) {
      return res.status(500).json({ code: 500, message: err.message || "server error" });
    }
  }

  /** GET /api/v1/user/findByUserName/:userName */
  public async findByUserName(req: Request, res: Response) {
    try {
      const { userName } = req.params;
      if (!userName) return res.status(400).json({ code: 400, message: "缺少 userName" });

      const out = await this.service.findByUserName(userName);
      return res.status(out.code).send(out);
    } catch (err: any) {
      return res.status(500).json({ code: 500, message: err.message || "server error" });
    }
  }
}
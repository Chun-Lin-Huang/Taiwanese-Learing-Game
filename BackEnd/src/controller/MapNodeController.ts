// src/controller/MapNodeController.ts
import { Contorller } from "../abstract/Contorller";
import { Request, Response } from "express";
import { MapNodeService } from "../Service/MapNodeService";
import type { resp } from "../utils/resp";

export class MapNodeController extends Contorller {
  protected service: MapNodeService;

  constructor() {
    super();
    this.service = new MapNodeService();
  }

  /** GET /api/v1/map-node/findByBoardId/:boardId */
  public async findByBoardId(req: Request, res: Response) {
    const out: resp<any> = { code: 200, message: "", body: undefined };
    try {
      const { boardId } = req.params;
      const rows = await this.service.getNodesByBoardId(boardId);
      if (!rows) { out.code = 500; out.message = "server error"; return res.status(500).send(out); }
      out.code = 200; out.message = "find success"; out.body = rows;
      return res.send(out);
    } catch {
      out.code = 500; out.message = "server error";
      return res.status(500).send(out);
    }
  }

  /** GET /api/v1/map-node/findById/:nodeId/:boardId */
  public async findById(req: Request, res: Response) {
    const { nodeId, boardId } = req.params;
    const out = await this.service.getNodeById(nodeId, boardId);
    return res.status(out.code).send(out);
  }

  /** POST /api/v1/map-node/insertOne */
  public async insertOne(req: Request, res: Response) {
    const out = await this.service.insertOne(req.body);
    return res.status(out.code).send(out);
  }

  /** POST /api/v1/map-node/insertMany */
  public async insertMany(req: Request, res: Response) {
    const { nodes } = req.body;
    const out = await this.service.insertMany(nodes);
    return res.status(out.code).send(out);
  }

  /** PUT /api/v1/map-node/updateById */
  public async updateById(req: Request, res: Response) {
    try {
      const { _id, ...updateData } = req.body || {};
      if (!_id) return res.status(400).json({ code: 400, message: "缺少 _id" });

      const out = await this.service.updateById(_id, updateData);
      return res.status(out.code).send(out);
    } catch (err: any) {
      return res.status(500).json({ code: 500, message: err.message || "server error" });
    }
  }

  /** DELETE /api/v1/map-node/deleteById/:id */
  public async deleteById(req: Request, res: Response) {
    const out = await this.service.deleteById(req.params.id);
    return res.status(out.code).send(out);
  }
}

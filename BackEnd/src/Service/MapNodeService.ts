// src/Service/MapNodeService.ts
import { MapNodeModel } from "../orm/schemas/mapNodeSchemas";
import { Types } from "mongoose";
import type { resp } from "../utils/resp";

export class MapNodeService {
  /** 取得指定地圖的所有節點 */
  async getNodesByBoardId(boardId: string): Promise<Array<any> | undefined> {
    try {
      const rows = await MapNodeModel.find({
        $or: [
          { board_id: boardId }, // String 格式
          { board_id: new Types.ObjectId(boardId) } // ObjectId 格式
        ]
      }).lean();
      return rows as any[];
    } catch {
      return undefined;
    }
  }

  /** 根據節點 ID 和地圖 ID 取得節點資訊 */
  async getNodeById(nodeId: string, boardId: string): Promise<resp<any>> {
    const out: resp<any> = { code: 200, message: "", body: undefined };
    try {
      if (!nodeId || !boardId) {
        out.code = 400; out.message = "缺少 nodeId 或 boardId"; return out;
      }

      const node = await MapNodeModel.findOne({ 
        node_id: nodeId,
        $or: [
          { board_id: boardId }, // String 格式
          { board_id: new Types.ObjectId(boardId) } // ObjectId 格式
        ]
      }).lean();

      if (!node) {
        out.code = 404; out.message = "節點不存在"; return out;
      }

      out.code = 200;
      out.message = "取得成功";
      out.body = {
        _id: String(node._id),
        node_id: node.node_id,
        board_id: node.board_id,
        name: node.name,
        type: node.type,
        description: node.description,
        challenge: node.challenge,
        chance: node.chance,
        shortcut: node.shortcut,
        property: node.property
      };
      return out;
    } catch {
      out.code = 500; out.message = "server error"; return out;
    }
  }

  /** 新增節點 */
  async insertOne(payload: any): Promise<resp<any>> {
    const out: resp<any> = { code: 200, message: "", body: undefined };
    try {
      const node_id = (payload.node_id || "").trim();
      const board_id = (payload.board_id || "").trim();
      const name = (payload.name || "").trim();
      const type = payload.type;

      if (!node_id || !board_id || !name || !type) {
        out.code = 400; out.message = "缺少必要欄位"; return out;
      }

      // 檢查節點 ID 是否已存在
      const exists = await MapNodeModel.findOne({ 
        node_id, 
        board_id 
      }).lean();
      if (exists) {
        out.code = 409; out.message = "節點 ID 已存在"; return out;
      }

      const doc = new MapNodeModel(payload);
      await doc.save();

      out.code = 201;
      out.message = "新增成功";
      out.body = { 
        _id: String(doc._id), 
        node_id: doc.node_id,
        board_id: doc.board_id,
        name: doc.name,
        type: doc.type
      };
      return out;
    } catch {
      out.code = 500; out.message = "server error"; return out;
    }
  }

  /** 批量新增節點 */
  async insertMany(nodes: any[]): Promise<resp<any>> {
    const out: resp<any> = { code: 200, message: "", body: undefined };
    try {
      if (!nodes || nodes.length === 0) {
        out.code = 400; out.message = "沒有要新增的節點"; return out;
      }

      const docs = await MapNodeModel.insertMany(nodes);

      out.code = 201;
      out.message = "批量新增成功";
      out.body = { 
        count: docs.length,
        nodes: docs.map((doc: any) => ({
          _id: String(doc._id),
          node_id: doc.node_id,
          name: doc.name,
          type: doc.type
        }))
      };
      return out;
    } catch {
      out.code = 500; out.message = "server error"; return out;
    }
  }

  /** 更新節點 */
  async updateById(_id: string, payload: any): Promise<resp<any>> {
    const out: resp<any> = { code: 200, message: "", body: undefined };
    try {
      if (!_id) { out.code = 400; out.message = "缺少 _id"; return out; }

      const updated = await MapNodeModel.findOneAndUpdate(
        { _id },
        { $set: payload },
        { new: true, runValidators: true }
      ).lean();

      if (!updated) { out.code = 404; out.message = "節點不存在"; return out; }

      out.code = 200;
      out.message = "更新成功";
      out.body = { 
        _id: String(updated._id), 
        node_id: updated.node_id,
        name: updated.name,
        type: updated.type
      };
      return out;
    } catch {
      out.code = 500; out.message = "server error"; return out;
    }
  }

  /** 刪除節點 */
  async deleteById(_id: string): Promise<resp<any>> {
    const out: resp<any> = { code: 200, message: "", body: undefined };
    try {
      if (!_id) { out.code = 400; out.message = "缺少 _id"; return out; }

      const deleted = await MapNodeModel.findByIdAndDelete(_id).lean();
      if (!deleted) { out.code = 404; out.message = "節點不存在"; return out; }

      out.code = 200;
      out.message = "刪除成功";
      out.body = { _id: String(deleted._id) };
      return out;
    } catch {
      out.code = 500; out.message = "server error"; return out;
    }
  }
}

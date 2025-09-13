// src/Service/MapEdgeService.ts
import { MapEdgeModel } from "../orm/schemas/mapEdgeSchemas";
import { Types } from "mongoose";
import type { resp } from "../utils/resp";

export class MapEdgeService {
  /** 取得指定地圖的所有連接 */
  async getEdgesByBoardId(boardId: string): Promise<resp<any>> {
    const out: resp<any> = { code: 200, message: "", body: undefined };
    try {
      // 支援 ObjectId 和 String 兩種格式的查詢
      const rows = await MapEdgeModel.find({
        $or: [
          { board_id: boardId }, // String 格式
          { board_id: new Types.ObjectId(boardId) } // ObjectId 格式
        ]
      }).lean();
      
      console.log(`查詢地圖連接: boardId=${boardId}, 找到 ${rows.length} 條記錄`);
      
      out.code = 200;
      out.message = "查詢成功";
      out.body = rows as any[];
      return out;
    } catch (error) {
      console.error('查詢地圖連接失敗:', error);
      out.code = 500; out.message = "查詢失敗"; return out;
    }
  }

  /** 根據起始節點取得可移動的目標節點 */
  async getEdgesFromNode(fromNode: string, boardId: string): Promise<Array<any> | undefined> {
    try {
      const rows = await MapEdgeModel.find({ 
        from: fromNode,
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

  /** 新增連接 */
  async insertOne(payload: any): Promise<resp<any>> {
    const out: resp<any> = { code: 200, message: "", body: undefined };
    try {
      const from = (payload.from || "").trim();
      const to = (payload.to || "").trim();
      const board_id = (payload.board_id || "").trim();
      const type = payload.type || 'normal';

      if (!from || !to || !board_id) {
        out.code = 400; out.message = "缺少必要欄位"; return out;
      }

      const doc = new MapEdgeModel({ 
        from, 
        to, 
        board_id, 
        type,
        condition: payload.condition || undefined
      });
      await doc.save();

      out.code = 201;
      out.message = "新增成功";
      out.body = { 
        _id: String(doc._id), 
        from: doc.from,
        to: doc.to,
        type: doc.type
      };
      return out;
    } catch {
      out.code = 500; out.message = "server error"; return out;
    }
  }

  /** 批量新增連接 */
  async insertMany(edges: any[]): Promise<resp<any>> {
    const out: resp<any> = { code: 200, message: "", body: undefined };
    try {
      if (!edges || edges.length === 0) {
        out.code = 400; out.message = "沒有要新增的連接"; return out;
      }

      const docs = await MapEdgeModel.insertMany(edges);

      out.code = 201;
      out.message = "批量新增成功";
      out.body = { 
        count: docs.length,
        edges: docs.map((doc: any) => ({
          _id: String(doc._id),
          from: doc.from,
          to: doc.to,
          type: doc.type
        }))
      };
      return out;
    } catch {
      out.code = 500; out.message = "server error"; return out;
    }
  }

  /** 更新連接 */
  async updateById(_id: string, payload: any): Promise<resp<any>> {
    const out: resp<any> = { code: 200, message: "", body: undefined };
    try {
      if (!_id) { out.code = 400; out.message = "缺少 _id"; return out; }

      const updated = await MapEdgeModel.findOneAndUpdate(
        { _id },
        { $set: payload },
        { new: true, runValidators: true }
      ).lean();

      if (!updated) { out.code = 404; out.message = "連接不存在"; return out; }

      out.code = 200;
      out.message = "更新成功";
      out.body = { 
        _id: String(updated._id), 
        from: updated.from,
        to: updated.to,
        type: updated.type
      };
      return out;
    } catch {
      out.code = 500; out.message = "server error"; return out;
    }
  }

  /** 刪除連接 */
  async deleteById(_id: string): Promise<resp<any>> {
    const out: resp<any> = { code: 200, message: "", body: undefined };
    try {
      if (!_id) { out.code = 400; out.message = "缺少 _id"; return out; }

      const deleted = await MapEdgeModel.findByIdAndDelete(_id).lean();
      if (!deleted) { out.code = 404; out.message = "連接不存在"; return out; }

      out.code = 200;
      out.message = "刪除成功";
      out.body = { _id: String(deleted._id) };
      return out;
    } catch {
      out.code = 500; out.message = "server error"; return out;
    }
  }
}

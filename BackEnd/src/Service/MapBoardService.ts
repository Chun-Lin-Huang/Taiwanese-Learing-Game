// src/Service/MapBoardService.ts
import { MapBoardModel } from "../orm/schemas/mapBoardSchemas";
import type { resp } from "../utils/resp";

export class MapBoardService {
  /** 取得所有地圖板塊 */
  async getAllBoards(): Promise<Array<any> | undefined> {
    try {
      const rows = await MapBoardModel.find().select("_id name start_node max_players version createdAt updatedAt").lean();
      return rows as any[];
    } catch {
      return undefined;
    }
  }

  /** 根據 ID 取得地圖板塊資訊 */
  async getBoardById(boardId: string): Promise<resp<any>> {
    const out: resp<any> = { code: 200, message: "", body: undefined };
    try {
      if (!boardId) {
        out.code = 400; out.message = "缺少 boardId"; return out;
      }

      const board = await MapBoardModel.findById(boardId).lean();
      if (!board) {
        out.code = 404; out.message = "地圖板塊不存在"; return out;
      }

      out.code = 200;
      out.message = "取得成功";
      out.body = {
        _id: String(board._id),
        name: board.name,
        start_node: board.start_node,
        max_players: board.max_players,
        version: board.version,
        createdAt: board.createdAt,
        updatedAt: board.updatedAt
      };
      return out;
    } catch {
      out.code = 500; out.message = "server error"; return out;
    }
  }

  /** 新增地圖板塊 */
  async insertOne(payload: any): Promise<resp<any>> {
    const out: resp<any> = { code: 200, message: "", body: undefined };
    try {
      const name = (payload.name || "").trim();
      const start_node = (payload.start_node || "").trim();
      const max_players = Number(payload.max_players) || 4;
      const version = Number(payload.version) || 1;

      if (!name || !start_node) {
        out.code = 400; out.message = "缺少 name 或 start_node"; return out;
      }

      if (max_players < 2 || max_players > 8) {
        out.code = 400; out.message = "max_players 必須在 2-8 之間"; return out;
      }

      const doc = new MapBoardModel({ 
        name, 
        start_node, 
        max_players, 
        version,
        image: payload.image || undefined
      });
      await doc.save();

      out.code = 201;
      out.message = "新增成功";
      out.body = { 
        _id: String(doc._id), 
        name: doc.name, 
        start_node: doc.start_node,
        max_players: doc.max_players,
        version: doc.version
      };
      return out;
    } catch {
      out.code = 500; out.message = "server error"; return out;
    }
  }

  /** 更新地圖板塊 */
  async updateById(_id: string, payload: any): Promise<resp<any>> {
    const out: resp<any> = { code: 200, message: "", body: undefined };
    try {
      if (!_id) { out.code = 400; out.message = "缺少 _id"; return out; }

      const toSet: any = {};
      if (payload.name !== undefined) toSet.name = String(payload.name).trim();
      if (payload.start_node !== undefined) toSet.start_node = String(payload.start_node).trim();
      if (payload.max_players !== undefined) {
        const maxPlayers = Number(payload.max_players);
        if (maxPlayers < 2 || maxPlayers > 8) {
          out.code = 400; out.message = "max_players 必須在 2-8 之間"; return out;
        }
        toSet.max_players = maxPlayers;
      }
      if (payload.version !== undefined) toSet.version = Number(payload.version);
      if (payload.image !== undefined) toSet.image = payload.image;

      if (Object.keys(toSet).length === 0) {
        out.code = 400; out.message = "沒有可更新的欄位"; return out;
      }

      const updated = await MapBoardModel.findOneAndUpdate(
        { _id },
        { $set: toSet },
        { new: true, runValidators: true }
      ).lean();

      if (!updated) { out.code = 404; out.message = "地圖板塊不存在"; return out; }

      out.code = 200;
      out.message = "更新成功";
      out.body = { 
        _id: String(updated._id), 
        name: updated.name, 
        start_node: updated.start_node,
        max_players: updated.max_players,
        version: updated.version
      };
      return out;
    } catch {
      out.code = 500; out.message = "server error"; return out;
    }
  }

  /** 刪除地圖板塊 */
  async deleteById(_id: string): Promise<resp<any>> {
    const out: resp<any> = { code: 200, message: "", body: undefined };
    try {
      if (!_id) { out.code = 400; out.message = "缺少 _id"; return out; }

      const deleted = await MapBoardModel.findByIdAndDelete(_id).lean();
      if (!deleted) { out.code = 404; out.message = "地圖板塊不存在"; return out; }

      out.code = 200;
      out.message = "刪除成功";
      out.body = { _id: String(deleted._id) };
      return out;
    } catch {
      out.code = 500; out.message = "server error"; return out;
    }
  }
}

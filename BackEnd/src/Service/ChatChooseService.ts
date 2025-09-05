// src/Service/ChatChooseService.ts
import { Types } from "mongoose";
import { ChatChooseModel } from "../orm/schemas/chatChooseSchemas"; // ← 請依你的實際檔名調整
import type { ChatChoose } from "../interfaces/ChatChoose";
import type { resp } from "../utils/resp";
import type { DBResp } from "../interfaces/DBResp";

export class ChatChooseService {
  /** 取得所有主題（依 updatedAt DESC） */
  async listAll(): Promise<resp<Array<DBResp<ChatChoose>>>> {
    const out: resp<Array<DBResp<ChatChoose>>> = { code: 200, message: "", body: [] as any };
    try {
      const rows = await ChatChooseModel.find({})
        .select("_id name")
        .sort({ updatedAt: -1 })
        .lean();

      out.code = 200;
      out.message = "find success";
      out.body = rows as any; // DBResp<ChatChoose>[]
      return out;
    } catch {
      out.code = 500;
      out.message = "server error";
      out.body = [] as any;
      return out;
    }
  }

  /** 依 _id 取得單一主題 */
  async getById(id: string): Promise<resp<DBResp<ChatChoose> | undefined>> {
    const out: resp<DBResp<ChatChoose> | undefined> = { code: 200, message: "", body: undefined };
    try {
      if (!Types.ObjectId.isValid(id)) {
        out.code = 400;
        out.message = "invalid id";
        return out;
      }

      const row = await ChatChooseModel.findById(new Types.ObjectId(id))
        .select("_id name")
        .lean();

      if (!row) {
        out.code = 404;
        out.message = "chatChoose not found";
        out.body = undefined;
        return out;
      }

      out.code = 200;
      out.message = "find success";
      out.body = row as any; // DBResp<ChatChoose>
      return out;
    } catch {
      out.code = 500;
      out.message = "server error";
      out.body = undefined;
      return out;
    }
  }
}
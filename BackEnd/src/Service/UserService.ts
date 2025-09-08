// src/Service/UserService.ts
import { UserModel } from "../orm/schemas/userSchemas";
import type { resp } from "../utils/resp";

type LoginBody = { userName: string; password: string };
type RegisterBody = { name: string; userName: string; password: string };
type UpdateBody = { _id: string; name?: string; userName?: string; password?: string };

export class UserService {
  /** 取得所有使用者 */
  async getAllUsers(): Promise<Array<any> | undefined> {
    try {
      const rows = await UserModel.find().select("_id name userName createdAt updatedAt").lean();
      return rows as any[];
    } catch {
      return undefined;
    }
  }

  /** 註冊（insertOne） */
  async insertOne(payload: RegisterBody): Promise<resp<any>> {
    const out: resp<any> = { code: 200, message: "", body: undefined };
    try {
      const name = (payload.name || "").trim();
      const userName = (payload.userName || "").trim().toLowerCase();
      const password = (payload.password || "").trim();
      if (!name || !userName || !password) {
        out.code = 400; out.message = "缺少 name / userName / password"; return out;
      }

      // 檢查重複 userName
      const exists = await UserModel.findOne({ userName }).lean();
      if (exists) {
        out.code = 409; out.message = "userName 已被使用"; return out;
      }

      const doc = new UserModel({ name, userName, password });
      await doc.save();

      out.code = 201;
      out.message = "register success";
      out.body = { _id: String(doc._id), name: doc.name, userName: doc.userName };
      return out;
    } catch {
      out.code = 500; out.message = "server error"; return out;
    }
  }

  /** 登入 */
  async login(payload: LoginBody): Promise<resp<any>> {
    const out: resp<any> = { code: 200, message: "", body: undefined };
    try {
      const userName = (payload.userName || "").trim().toLowerCase();
      const password = (payload.password || "").trim();
      if (!userName || !password) {
        out.code = 400; out.message = "缺少 userName / password"; return out;
      }

      const user = await UserModel.findOne({ userName });
      if (!user) { out.code = 404; out.message = "user not found"; return out; }

      const ok = await user.comparePassword(password);
      if (!ok) { out.code = 401; out.message = "invalid password"; return out; }

      out.code = 200;
      out.message = "login success";
      out.body = { _id: String(user._id), name: user.name, userName: user.userName };
      return out;
    } catch {
      out.code = 500; out.message = "server error"; return out;
    }
  }

  /** 依 _id 更新（可選改 name / userName / password） */
  async updateById(_id: string, payload: Partial<UpdateBody>): Promise<resp<any>> {
    const out: resp<any> = { code: 200, message: "", body: undefined };
    try {
      if (!_id) { out.code = 400; out.message = "缺少 _id"; return out; }

      const toSet: any = {};
      if (payload.name !== undefined) toSet.name = String(payload.name).trim();
      if (payload.userName !== undefined) toSet.userName = String(payload.userName).trim().toLowerCase();
      if (payload.password !== undefined && payload.password.trim()) {
        toSet.password = payload.password.trim(); // 會由 schema 中 pre('findOneAndUpdate') 負責雜湊
      }

      if (Object.keys(toSet).length === 0) {
        out.code = 400; out.message = "沒有可更新的欄位"; return out;
      }

      // 若有更名 userName，確認是否重複
      if (toSet.userName) {
        const dup = await UserModel.findOne({ _id: { $ne: _id }, userName: toSet.userName }).lean();
        if (dup) { out.code = 409; out.message = "userName 已被使用"; return out; }
      }

      const updated = await UserModel.findOneAndUpdate(
        { _id },
        { $set: toSet },
        { new: true, runValidators: true }
      ).lean();

      if (!updated) { out.code = 404; out.message = "user not found"; return out; }

      out.code = 200;
      out.message = "update success";
      out.body = { _id: String(updated._id), name: updated.name, userName: updated.userName };
      return out;
    } catch {
      out.code = 500; out.message = "server error"; return out;
    }
  }
}
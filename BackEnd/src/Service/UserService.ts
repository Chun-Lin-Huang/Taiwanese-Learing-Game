import { Service } from "../abstract/Service";
import { logger } from "../middlewares/log";
import { userModel } from "../orm/schemas/userSchemas";
import { Document } from "mongoose"
import { MongoDB } from "../utils/MongoDB";
import { DBResp } from "../interfaces/DBResp";
import { resp } from "../utils/resp";
import { Users } from "../interfaces/Users";
import mongoose, { Types } from "mongoose";

type seatInfo = {
    schoolName: string,
    department: string,
    seatNumber: string
}


type SafeUser = Omit<Users, "password"> & { _id?: string };

function sanitize(u: any): SafeUser {
    if (!u) return u;
    const obj = u.toObject ? u.toObject() : u;
    // 刪掉敏感欄位
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...safe } = obj;
    return safe;
}

export class UserService extends Service {

    public async getAllUsers(): Promise<Array<DBResp<Users>> | undefined> {
        try {
            const res: Array<DBResp<Users>> = await userModel.find({});
            return res;
        } catch (error) {
            return undefined;
        }

    }

    /**
     * 新增使用者(只檢查 userName 是否重複)
     * @param info 使用者資訊
     * @returns resp
     */
    public async insertOne(info: Users): Promise<resp<DBResp<Users> | undefined>> {
        const result: resp<DBResp<Users> | undefined> = {
            code: 200,
            message: "",
            body: undefined,
        };

        try {
            const userName = info.userName.toLowerCase();

            // 檢查是否已存在
            const exists = await userModel.exists({ userName });
            if (exists) {
                result.code = 409;
                result.message = "使用者名稱已存在";
                return result;
            }

            // 建立新使用者
            const created = await userModel.create({
                name: info.name,
                userName,
                password: info.password, // 現階段照你需求存明碼
            });

            result.code = 201;
            result.body = created.toObject() as DBResp<Users>;
            return result;
        } catch (e) {
            result.code = 500;
            result.message = "server error";
            return result;
        }
    }

    /**
     * 檢查使用者名稱是否已存在 (給前端即時驗證用)
     */
    public async isUserNameTaken(userName: string): Promise<boolean> {
        const exists = await userModel.exists({ userName: userName.toLowerCase() });
        return !!exists;
    }

    /**
     * 使用者登入
     * @param info 使用者資訊
     * @returns resp
     */
    public async login(info: { userName: string; password: string }): Promise<resp<DBResp<SafeUser> | undefined>> {
        const result: resp<DBResp<SafeUser> | undefined> = {
            code: 200,
            message: "",
            body: undefined,
        };

        try {
            const userName = info.userName.toLowerCase();

            const user = await userModel.findOne({ userName }).lean();
            if (!user || user.password !== info.password) {
                result.code = 401;
                result.message = "帳號或密碼錯誤";
                return result;
            }

            result.code = 200;
            result.message = "login success";
            result.body = sanitize(user) as unknown as DBResp<SafeUser>;
            return result;
        } catch (e) {
            result.code = 500;
            result.message = "server error";
            return result;
        }
    }

    /**
     * 編輯使用者的資訊
     * @param id 使用者 ID
     * @param data 
     * @returns 
     */
    public async updateById(
        id: string,
        data: Partial<Pick<Users, "name" | "userName">>
    ): Promise<resp<DBResp<SafeUser> | undefined>> {
        const result: resp<DBResp<SafeUser> | undefined> = { code: 200, message: "", body: undefined };

        try {
            if (!data || Object.keys(data).length === 0) {
                result.code = 400; result.message = "沒有可更新的欄位"; return result;
            }

            // 兼容 ObjectId/字串型別
            const filter = mongoose.isValidObjectId(id) ? { _id: new Types.ObjectId(id) } : { _id: id };

            // 先抓目前資料
            const current = await userModel.findOne(filter).select("name userName").lean();
            if (!current) { result.code = 404; result.message = "使用者不存在"; return result; }

            // 準備 payload（避免沒變更）
            const payload: Partial<Users> = {};

            if (typeof data.name === "string") {
                const v = data.name.trim();
                if (v && v !== current.name) payload.name = v;
            }

            if (typeof data.userName === "string") {
                const v = data.userName.trim().toLowerCase();
                if (v && v !== current.userName) {
                    const dup = await userModel.exists({ userName: v, _id: { $ne: current._id } });
                    if (dup) { result.code = 409; result.message = "使用者名稱已存在"; return result; }
                    payload.userName = v;
                }
            }

            if (Object.keys(payload).length === 0) {
                result.code = 200; result.message = "no changes"; result.body = sanitize(current) as any; return result;
            }

            const updated = await userModel
                .findOneAndUpdate(filter, { $set: payload }, { new: true, runValidators: true, context: "query" })
                .select("-password");

            if (!updated) { result.code = 404; result.message = "使用者不存在"; return result; }

            result.code = 200; result.message = "update success";
            result.body = sanitize(updated) as any;
            return result;
        } catch (e: any) {
            if (e?.name === "CastError") { result.code = 400; result.message = "無效的 _id"; return result; }
            result.code = 500; result.message = "server error"; return result;
        }
    }
}
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const Service_1 = require("../abstract/Service");
const userSchemas_1 = require("../orm/schemas/userSchemas");
const mongoose_1 = __importStar(require("mongoose"));
function sanitize(u) {
    if (!u)
        return u;
    const obj = u.toObject ? u.toObject() : u;
    // 刪掉敏感欄位
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password } = obj, safe = __rest(obj, ["password"]);
    return safe;
}
class UserService extends Service_1.Service {
    getAllUsers() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const res = yield userSchemas_1.userModel.find({});
                return res;
            }
            catch (error) {
                return undefined;
            }
        });
    }
    /**
     * 新增使用者(只檢查 userName 是否重複)
     * @param info 使用者資訊
     * @returns resp
     */
    insertOne(info) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = {
                code: 200,
                message: "",
                body: undefined,
            };
            try {
                const userName = info.userName.toLowerCase();
                // 檢查是否已存在
                const exists = yield userSchemas_1.userModel.exists({ userName });
                if (exists) {
                    result.code = 409;
                    result.message = "使用者名稱已存在";
                    return result;
                }
                // 建立新使用者
                const created = yield userSchemas_1.userModel.create({
                    name: info.name,
                    userName,
                    password: info.password, // 現階段照你需求存明碼
                });
                result.code = 201;
                result.body = created.toObject();
                return result;
            }
            catch (e) {
                result.code = 500;
                result.message = "server error";
                return result;
            }
        });
    }
    /**
     * 檢查使用者名稱是否已存在 (給前端即時驗證用)
     */
    isUserNameTaken(userName) {
        return __awaiter(this, void 0, void 0, function* () {
            const exists = yield userSchemas_1.userModel.exists({ userName: userName.toLowerCase() });
            return !!exists;
        });
    }
    /**
     * 使用者登入
     * @param info 使用者資訊
     * @returns resp
     */
    login(info) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = {
                code: 200,
                message: "",
                body: undefined,
            };
            try {
                const userName = info.userName.toLowerCase();
                const user = yield userSchemas_1.userModel.findOne({ userName }).lean();
                if (!user || user.password !== info.password) {
                    result.code = 401;
                    result.message = "帳號或密碼錯誤";
                    return result;
                }
                result.code = 200;
                result.message = "login success";
                result.body = sanitize(user);
                return result;
            }
            catch (e) {
                result.code = 500;
                result.message = "server error";
                return result;
            }
        });
    }
    /**
     * 編輯使用者的資訊
     * @param id 使用者 ID
     * @param data
     * @returns
     */
    updateById(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = { code: 200, message: "", body: undefined };
            try {
                if (!data || Object.keys(data).length === 0) {
                    result.code = 400;
                    result.message = "沒有可更新的欄位";
                    return result;
                }
                // 兼容 ObjectId/字串型別
                const filter = mongoose_1.default.isValidObjectId(id) ? { _id: new mongoose_1.Types.ObjectId(id) } : { _id: id };
                // 先抓目前資料
                const current = yield userSchemas_1.userModel.findOne(filter).select("name userName").lean();
                if (!current) {
                    result.code = 404;
                    result.message = "使用者不存在";
                    return result;
                }
                // 準備 payload（避免沒變更）
                const payload = {};
                if (typeof data.name === "string") {
                    const v = data.name.trim();
                    if (v && v !== current.name)
                        payload.name = v;
                }
                if (typeof data.userName === "string") {
                    const v = data.userName.trim().toLowerCase();
                    if (v && v !== current.userName) {
                        const dup = yield userSchemas_1.userModel.exists({ userName: v, _id: { $ne: current._id } });
                        if (dup) {
                            result.code = 409;
                            result.message = "使用者名稱已存在";
                            return result;
                        }
                        payload.userName = v;
                    }
                }
                if (Object.keys(payload).length === 0) {
                    result.code = 200;
                    result.message = "no changes";
                    result.body = sanitize(current);
                    return result;
                }
                const updated = yield userSchemas_1.userModel
                    .findOneAndUpdate(filter, { $set: payload }, { new: true, runValidators: true, context: "query" })
                    .select("-password");
                if (!updated) {
                    result.code = 404;
                    result.message = "使用者不存在";
                    return result;
                }
                result.code = 200;
                result.message = "update success";
                result.body = sanitize(updated);
                return result;
            }
            catch (e) {
                if ((e === null || e === void 0 ? void 0 : e.name) === "CastError") {
                    result.code = 400;
                    result.message = "無效的 _id";
                    return result;
                }
                result.code = 500;
                result.message = "server error";
                return result;
            }
        });
    }
}
exports.UserService = UserService;

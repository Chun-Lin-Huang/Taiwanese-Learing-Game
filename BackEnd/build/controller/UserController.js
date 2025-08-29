"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const Contorller_1 = require("../abstract/Contorller");
const UserService_1 = require("../Service/UserService");
require('dotenv').config();
class UserController extends Contorller_1.Contorller {
    constructor() {
        super();
        this.service = new UserService_1.UserService();
    }
    findAll(Request, Response) {
        return __awaiter(this, void 0, void 0, function* () {
            const res = {
                code: 200,
                message: "",
                body: undefined
            };
            const dbResp = yield this.service.getAllUsers();
            if (dbResp) {
                res.body = dbResp;
                res.message = "find sucess";
                Response.send(res);
            }
            else {
                res.code = 500;
                res.message = "server error";
                Response.status(500).send(res);
            }
        });
    }
    insertOne(Request, Response) {
        return __awaiter(this, void 0, void 0, function* () {
            const resp = yield this.service.insertOne(Request.body);
            Response.status(resp.code).send(resp);
        });
    }
    login(Request, Response) {
        return __awaiter(this, void 0, void 0, function* () {
            const resp = yield this.service.login(Request.body);
            Response.status(resp.code).send(resp);
        });
    }
    updateById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { _id, name, userName } = req.body || {};
                if (!_id) {
                    return res.status(400).json({ code: 400, message: "缺少 _id" });
                }
                const resp = yield this.service.updateById(_id, { name, userName });
                return res.status(resp.code).send(resp);
            }
            catch (err) {
                return res.status(500).json({ code: 500, message: err.message || "server error" });
            }
        });
    }
}
exports.UserController = UserController;

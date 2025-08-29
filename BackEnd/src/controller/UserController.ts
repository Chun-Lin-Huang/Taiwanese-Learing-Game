import { Contorller } from "../abstract/Contorller";
import { Request, response, Response } from "express";
import { UserService } from "../Service/UserService";
import { resp } from "../utils/resp";
import { DBResp } from "../interfaces/DBResp";
import { Users } from "../interfaces/Users";
require('dotenv').config()

export class UserController extends Contorller {
    protected service: UserService;

    constructor() {
        super();
        this.service = new UserService();
    }

    public async findAll(Request: Request, Response: Response) {

        const res: resp<Array<DBResp<Users>> | undefined> = {
            code: 200,
            message: "",
            body: undefined
        }

        const dbResp = await this.service.getAllUsers();
        if (dbResp) {
            res.body = dbResp;
            res.message = "find sucess";
            Response.send(res);
        } else {
            res.code = 500;
            res.message = "server error";
            Response.status(500).send(res);
        }

    }

    public async insertOne(Request: Request, Response: Response) {
        const resp = await this.service.insertOne(Request.body)
        Response.status(resp.code).send(resp)
    }

    public async login(Request: Request, Response: Response) {
        const resp = await this.service.login(Request.body)
        Response.status(resp.code).send(resp)
    }

    public async updateById(req: Request, res: Response) {
        try {
            const { _id, name, userName } = req.body || {};
            if (!_id) {
                return res.status(400).json({ code: 400, message: "缺少 _id" });
            }

            const resp = await this.service.updateById(_id, { name, userName });
            return res.status(resp.code).send(resp);
        } catch (err: any) {
            return res.status(500).json({ code: 500, message: err.message || "server error" });
        }
    }
}
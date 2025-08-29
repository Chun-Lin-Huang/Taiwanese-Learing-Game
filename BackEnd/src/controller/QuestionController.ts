import { Contorller } from "../abstract/Contorller";
import { Request, response, Response } from "express";
import { QuestionService } from "../Service/QuestionService";
import { resp } from "../utils/resp";
import { DBResp } from "../interfaces/DBResp";
import { Question } from "../interfaces/Question";
require('dotenv').config()

export class QuestionController extends Contorller {
    protected service: QuestionService;

    constructor() {
            super();
            this.service = new QuestionService();
        }

    /**
     * 紀錄問題
     * @param Request 
     * @param Response 
     */
    public async create(Request: Request, Response: Response) {
        const resp = await this.service.create(Request.body)
        Response.status(resp.code).send(resp)
    }

    /**
     * 取得問題清單（可依 userName 過濾）
     * @param Request 
     * @param Response 
     */
    public async list(Request: Request, Response: Response) {
        const { userName } = Request.query || {};
        const resp = await this.service.list(userName as string | undefined)
        Response.status(resp.code).send(resp)
    }

    /**
     * 取得所有問題
     * @param Request 
     * @param Response 
     */
        public async findAll(Request: Request, Response: Response) {
    
            const res: resp<Array<DBResp<Question>> | undefined> = {
                code: 200,
                message: "",
                body: undefined
            }
    
            const dbResp = await this.service.getAllQuestions();
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
}
    
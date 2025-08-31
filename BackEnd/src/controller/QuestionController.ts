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
}
    
import { Route } from "../abstract/Route"
import { QuestionController } from "../controller/QuestionController";
import { logger } from "../middlewares/log";

export class QuestionRoute extends Route {

    protected url: string;
    protected Contorller = new QuestionController();

    constructor() {
        super()
        this.url = '/api/v1/question/'
        this.setRoutes()
    }

    protected setRoutes(): void {

        this.router.get(`${this.url}findAllQuestion`, (req, res) => {
            this.Contorller.findAll(req, res);
        })

        this.router.get(`${this.url}listByUserName`, (req, res) => {
            this.Contorller.list(req, res);
        });

        /**
         * 紀錄問題
         * request body {
         * userName: string",
         * questionText: string
         * } 
         * @returns resp<Question>
         */
        this.router.post(`${this.url}create`, (req, res) => {
            this.Contorller.create(req, res);
        })
    }
}
import { Route } from "../abstract/Route"
import { UserController } from "../controller/UserController";
import { logger } from "../middlewares/log";

export class UserRoute extends Route {

    protected url: string;
    protected Contorller = new UserController();

    constructor() {
        super()
        this.url = '/api/v1/user/'
        this.setRoutes()
    }

    protected setRoutes(): void {

        this.router.get(`${this.url}findAll`, (req, res) => {
            this.Contorller.findAll(req, res);
        })

        /**
         * 新增使用者(註冊)
         * request body {
         *  name: string,
         *  userName: string",
         *  password: string,
         * } 
         * @returns resp<Users>
         */
        this.router.post(`${this.url}insertOne`, (req, res) => {
            this.Contorller.insertOne(req, res);
        })

        /**
         * 使用者登入
         * request body { 
         * userName: string,
         * password: string
         * }
         * @returns resp<Users>
         */
        this.router.post(`${this.url}login`, (req, res) => {
            this.Contorller.login(req, res);
        });

        /**
         * 更新使用者資訊
         * request body {
         * name?: string,
         * userName?: string,
         * }
         * @returns resp<Users>
         */
        this.router.put(`${this.url}updateById`, (req, res) => {
            this.Contorller.updateById(req, res);
        });
    }
}
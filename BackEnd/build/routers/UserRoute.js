"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRoute = void 0;
const Route_1 = require("../abstract/Route");
const UserController_1 = require("../controller/UserController");
class UserRoute extends Route_1.Route {
    constructor() {
        super();
        this.Contorller = new UserController_1.UserController();
        this.url = '/api/v1/user/';
        this.setRoutes();
    }
    setRoutes() {
        this.router.get(`${this.url}findAll`, (req, res) => {
            this.Contorller.findAll(req, res);
        });
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
        });
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
exports.UserRoute = UserRoute;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuestionRoute = void 0;
const Route_1 = require("../abstract/Route");
const QuestionController_1 = require("../controller/QuestionController");
class QuestionRoute extends Route_1.Route {
    constructor() {
        super();
        this.Contorller = new QuestionController_1.QuestionController();
        this.url = '/api/v1/question/';
        this.setRoutes();
    }
    setRoutes() {
        this.router.get(`${this.url}findAllQuestion`, (req, res) => {
            this.Contorller.findAll(req, res);
        });
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
        });
    }
}
exports.QuestionRoute = QuestionRoute;

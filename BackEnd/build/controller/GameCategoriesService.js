"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PageController = void 0;
const Contorller_1 = require("../abstract/Contorller");
const PageService_1 = require("../Service/PageService");
require('dotenv').config();
class PageController extends Contorller_1.Contorller {
    constructor() {
        super();
        this.service = new PageService_1.PageService();
    }
    sendPage(Request, Response) {
        Response.sendFile(process.env.HomePagePath);
    }
}
exports.PageController = PageController;

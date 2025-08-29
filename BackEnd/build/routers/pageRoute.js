"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PageRoute = void 0;
const Route_1 = require("../abstract/Route");
const pageController_1 = require("../controller/pageController");
class PageRoute extends Route_1.Route {
    constructor() {
        super();
        this.Contorller = new pageController_1.PageController();
        this.url = '/';
        this.setRoutes();
    }
    setRoutes() {
        this.router.get(`${this.url}`, (req, res) => {
            this.Contorller.sendPage(req, res);
        });
    }
}
exports.PageRoute = PageRoute;

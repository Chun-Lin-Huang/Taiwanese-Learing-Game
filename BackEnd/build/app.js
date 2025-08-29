"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DB = void 0;
const express_1 = __importDefault(require("express"));
const Routers_1 = require("./Routers");
const log_1 = require("./middlewares/log");
const http = require('http');
const cors_1 = __importDefault(require("cors"));
const MongoDB_1 = require("./utils/MongoDB");
require('dotenv').config();
const app = (0, express_1.default)();
const server = http.createServer(app);
exports.DB = new MongoDB_1.MongoDB({
    name: process.env.DBUSER,
    password: process.env.DBPASSWORD,
    host: process.env.DBHOST,
    port: process.env.DBPORT,
    dbName: process.env.DBNAME
});
// 確保從環境變數中讀取前端的 origin URL
const frontendOrigin = process.env.FRONTEND_URL || "http://localhost:5173"; // 默認使用 http://localhost:5173
app.use((0, cors_1.default)({
    origin: frontendOrigin,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    preflightContinue: false,
    optionsSuccessStatus: 200,
    exposedHeaders: ['Content-Disposition'],
    credentials: true, // 允許帶憑證的請求
}));
app.use(express_1.default.json({ limit: '50mb' }));
app.use(express_1.default.urlencoded({ extended: false }));
app.use('/assets', express_1.default.static(process.env.assetsPath));
for (const route of Routers_1.router) {
    app.use(route.getRouter());
}
server.listen(process.env.PORT, () => {
    log_1.logger.info('listening on *:' + process.env.PORT);
});

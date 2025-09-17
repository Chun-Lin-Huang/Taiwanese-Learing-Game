import express from 'express'
import {router} from "./Routers"
import { logger } from './middlewares/log';
const http = require('http');
import cors from 'cors';
import { MongoDB } from './utils/MongoDB';
require('dotenv').config()
const app: express.Application = express()
const server = http.createServer(app);

export const DB = new MongoDB({
  name:process.env.DBUSER as string,
  password:process.env.DBPASSWORD as string,
  host:process.env.DBHOST as string,
  port:process.env.DBPORT as string,
  dbName:process.env.DBNAME as string
});

// 支持多個前端來源，包括外部 IP 訪問
const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://gai-bot.com",
  "https://gai-bot.com",
  "http://www.gai-bot.com",
  "https://www.gai-bot.com",
  "http://163.13.202.125:5173",  // 添加服務器IP
  "https://163.13.202.125:5173",
  "http://163.13.202.125",       // 添加服務器IP (無端口)
  "https://163.13.202.125",
  process.env.FRONTEND_URL
].filter((origin): origin is string => Boolean(origin));

app.use(cors({
  origin: function (origin, callback) {
    // 允許沒有 origin 的請求（如移動應用、Postman等）
    if (!origin) return callback(null, true);
    
    // 檢查是否在允許列表中
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    }
    
    // 允許所有本地開發環境
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
      return callback(null, true);
    }
    
    // 允許服務器IP的所有端口
    if (origin.includes('163.13.202.125')) {
      return callback(null, true);
    }
    
    // 其他情況拒絕
    return callback(new Error('Not allowed by CORS'));
  },
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  preflightContinue: false,
  optionsSuccessStatus: 200,
  exposedHeaders: ['Content-Disposition'],
  credentials: true,  // 允許帶憑證的請求
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: false }));
app.use('/assets', express.static(process.env.assetsPath as string));

for (const route of router) {
  app.use(route.getRouter());
}

server.listen(process.env.PORT, '0.0.0.0', () => {
  logger.info('listening on 0.0.0.0:' + process.env.PORT);
});
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const winston_1 = require("winston");
const winston_daily_rotate_file_1 = __importDefault(require("winston-daily-rotate-file"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
require("dotenv/config");
const colors = { error: 'red', warn: 'yellow', info: 'green', http: 'magenta', debug: 'white' };
(0, winston_1.addColors)(colors);
// 檔案路徑（用大寫環境變數，並給預設值）
const LOG_DIR = process.env.LOG_PATH || process.env.LogPath || path_1.default.resolve(process.cwd(), 'logs');
if (!fs_1.default.existsSync(LOG_DIR))
    fs_1.default.mkdirSync(LOG_DIR, { recursive: true });
const fileFormat = winston_1.format.combine(winston_1.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), winston_1.format.printf(i => `${i.timestamp} ${i.level}: ${i.message}`));
const consoleFormat = winston_1.format.combine(winston_1.format.colorize({ all: true }), winston_1.format.timestamp({ format: 'HH:mm:ss' }), winston_1.format.printf(i => `${i.timestamp} ${i.level}: ${i.message}`));
const rotate = new winston_daily_rotate_file_1.default({
    filename: path_1.default.join(LOG_DIR, '%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    zippedArchive: false,
    maxSize: '20m',
    maxFiles: '30d',
    level: process.env.LOG_LEVEL || 'info',
});
exports.logger = (0, winston_1.createLogger)({
    level: process.env.LOG_LEVEL || 'info',
    format: fileFormat,
    transports: [
        rotate,
        new winston_1.transports.Console({ format: consoleFormat }) // ← 加這個就會印到終端
    ],
    exceptionHandlers: [
        new winston_1.transports.Console({ format: consoleFormat }),
        new winston_daily_rotate_file_1.default({
            filename: path_1.default.join(LOG_DIR, 'exceptions-%DATE%.log'),
            datePattern: 'YYYY-MM-DD',
            maxFiles: '30d',
        }),
    ],
    rejectionHandlers: [
        new winston_1.transports.Console({ format: consoleFormat }),
        new winston_daily_rotate_file_1.default({
            filename: path_1.default.join(LOG_DIR, 'rejections-%DATE%.log'),
            datePattern: 'YYYY-MM-DD',
            maxFiles: '30d',
        }),
    ],
});

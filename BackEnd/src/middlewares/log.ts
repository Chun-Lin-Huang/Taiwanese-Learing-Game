import { createLogger, format, transports, addColors } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import fs from 'fs';
import path from 'path';
import 'dotenv/config';

const colors = { error: 'red', warn: 'yellow', info: 'green', http: 'magenta', debug: 'white' };
addColors(colors);

// 檔案路徑（用大寫環境變數，並給預設值）
const LOG_DIR = process.env.LOG_PATH || process.env.LogPath || path.resolve(process.cwd(), 'logs');
if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR, { recursive: true });

const fileFormat = format.combine(
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  format.printf(i => `${i.timestamp} ${i.level}: ${i.message}`)
);

const consoleFormat = format.combine(
  format.colorize({ all: true }),
  format.timestamp({ format: 'HH:mm:ss' }),
  format.printf(i => `${i.timestamp} ${i.level}: ${i.message}`)
);

const rotate = new DailyRotateFile({
  filename: path.join(LOG_DIR, '%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  zippedArchive: false,
  maxSize: '20m',
  maxFiles: '30d',
  level: process.env.LOG_LEVEL || 'info',
});

export const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: fileFormat,
  transports: [
    rotate,
    new transports.Console({ format: consoleFormat }) // ← 加這個就會印到終端
  ],
  exceptionHandlers: [
    new transports.Console({ format: consoleFormat }),
    new DailyRotateFile({
      filename: path.join(LOG_DIR, 'exceptions-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxFiles: '30d',
    }),
  ],
  rejectionHandlers: [
    new transports.Console({ format: consoleFormat }),
    new DailyRotateFile({
      filename: path.join(LOG_DIR, 'rejections-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxFiles: '30d',
    }),
  ],
});
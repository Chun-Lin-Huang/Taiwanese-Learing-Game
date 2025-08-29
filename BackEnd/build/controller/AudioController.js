"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AudioController = void 0;
// src/controller/AudioController.ts
const Contorller_1 = require("../abstract/Contorller");
const AudioService_1 = require("../Service/AudioService");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
class AudioController extends Contorller_1.Contorller {
    constructor() {
        super();
        this.service = new AudioService_1.AudioService();
    }
    /**
     * ① 依 questionId 取得音檔（回傳含可播 URL）
     * GET /api/v1/audio/by-question/:questionId
     */
    byQuestion(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { questionId } = req.params;
            if (!questionId) {
                return res.status(400).json({ code: 400, message: "questionId required" });
            }
            const result = yield this.service.getByQuestion(questionId);
            return res.status(result.code).json(result);
        });
    }
    /**
     * ② 串流播放音檔（支援 Range）
     * GET /api/v1/audio/stream/:audioId
     */
    stream(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { audioId } = req.params;
                if (!audioId) {
                    return res.status(400).json({ code: 400, message: "audioId required" });
                }
                const filePath = yield this.service.getFilePathByDocId(audioId);
                if (!filePath) {
                    return res.status(404).json({ code: 404, message: "audio file not found" });
                }
                // 推斷 Content-Type
                const ext = path_1.default.extname(filePath).toLowerCase();
                const contentType = ext === ".mp3" ? "audio/mpeg" :
                    ext === ".wav" ? "audio/wav" :
                        ext === ".ogg" ? "audio/ogg" :
                            ext === ".m4a" ? "audio/mp4" : "application/octet-stream";
                const stat = fs_1.default.statSync(filePath);
                const total = stat.size;
                const range = req.headers.range;
                if (range) {
                    // 206 Partial Content
                    const [startStr, endStr] = range.replace(/bytes=/, "").split("-");
                    const start = parseInt(startStr, 10);
                    const end = endStr ? parseInt(endStr, 10) : total - 1;
                    if (Number.isNaN(start) || Number.isNaN(end) || start >= total || end >= total || start > end) {
                        return res.status(416).set("Content-Range", `bytes */${total}`).end();
                    }
                    const chunkSize = end - start + 1;
                    res.writeHead(206, {
                        "Content-Range": `bytes ${start}-${end}/${total}`,
                        "Accept-Ranges": "bytes",
                        "Content-Length": chunkSize,
                        "Content-Type": contentType,
                    });
                    fs_1.default.createReadStream(filePath, { start, end }).pipe(res);
                }
                else {
                    // 200 OK (完整檔案)
                    res.writeHead(200, {
                        "Content-Length": total,
                        "Content-Type": contentType,
                        "Accept-Ranges": "bytes",
                    });
                    fs_1.default.createReadStream(filePath).pipe(res);
                }
            }
            catch (e) {
                return res.status(500).json({ code: 500, message: (e === null || e === void 0 ? void 0 : e.message) || "server error" });
            }
        });
    }
}
exports.AudioController = AudioController;

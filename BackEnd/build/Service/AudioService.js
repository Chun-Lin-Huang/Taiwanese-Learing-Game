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
exports.AudioService = void 0;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const gameAudioSchemas_1 = require("../orm/schemas/gameAudioSchemas");
class AudioService {
    constructor() {
        this.cacheDir = path_1.default.resolve(process.cwd(), "uploads/audio.cache");
        this.publicStreamPath = "/api/v1/audio/stream/";
        this.ensureDir(this.cacheDir);
    }
    ensureDir(dir) {
        if (!fs_1.default.existsSync(dir))
            fs_1.default.mkdirSync(dir, { recursive: true });
    }
    buildPublicUrl(idOrFileId) {
        const base = process.env.BASE_URL || "http://127.0.0.1:2083";
        return `${base}${this.publicStreamPath}${idOrFileId}`;
    }
    toSafeFilePath(fileName) {
        const fp = path_1.default.resolve(this.cacheDir, fileName);
        if (!fp.startsWith(this.cacheDir))
            throw new Error("unsafe path");
        return fp;
    }
    toNodeBuffer(bin) {
        if (!bin)
            return null;
        if (Buffer.isBuffer(bin))
            return bin;
        // mongoose 的 BSON Binary: { buffer: Buffer }
        // @ts-ignore
        if ((bin === null || bin === void 0 ? void 0 : bin.buffer) && Buffer.isBuffer(bin.buffer)) {
            // @ts-ignore
            return bin.buffer;
        }
        // { type: 'Buffer', data: [...] }
        // @ts-ignore
        if ((bin === null || bin === void 0 ? void 0 : bin.type) === "Buffer" && Array.isArray(bin.data)) {
            // @ts-ignore
            return Buffer.from(bin.data);
        }
        return null;
    }
    /** ① 依 questionId 取得音檔（回傳含可播 URL） */
    getByQuestion(questionId) {
        return __awaiter(this, void 0, void 0, function* () {
            const out = {
                code: 200,
                message: "",
                body: undefined,
            };
            try {
                if (!questionId) {
                    out.code = 400;
                    out.message = "questionId required";
                    return out;
                }
                // ⚠️ 你的 DB 裡 questionId 是「字串」，不要轉 ObjectId
                const rows = yield gameAudioSchemas_1.GameAudioModel.find({
                    questionId,
                    isActive: true,
                })
                    .select("_id gameCategoryId questionId originalFilename audioType fileSize duration isActive")
                    .lean();
                const withUrl = (rows || []).map((r) => (Object.assign(Object.assign({}, r), { url: this.buildPublicUrl(String(r._id)) })));
                out.code = 200;
                out.message = "find success";
                out.body = withUrl;
                return out;
            }
            catch (_a) {
                out.code = 500;
                out.message = "server error";
                return out;
            }
        });
    }
    /** ② 依音檔文件 _id 取得本機可串流的檔案路徑（快取到本機檔案） */
    getFilePathByDocId(audioId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!audioId)
                return null;
            const doc = yield gameAudioSchemas_1.GameAudioModel.findById(audioId)
                .select("originalFilename audioData")
                .lean();
            if (!doc)
                return null;
            const ext = doc.originalFilename && path_1.default.extname(doc.originalFilename)
                ? path_1.default.extname(doc.originalFilename)
                : ".bin";
            const fileName = `${audioId}${ext}`;
            const filePath = this.toSafeFilePath(fileName);
            if (fs_1.default.existsSync(filePath))
                return filePath;
            const buf = this.toNodeBuffer(doc.audioData);
            if (!buf)
                return null;
            fs_1.default.writeFileSync(filePath, buf);
            return filePath;
        });
    }
}
exports.AudioService = AudioService;

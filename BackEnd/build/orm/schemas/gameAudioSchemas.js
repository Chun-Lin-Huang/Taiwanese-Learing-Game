"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameAudioModel = void 0;
// src/orm/schemas/gameAudioSchemas.ts
const mongoose_1 = require("mongoose");
const gameAudioSchema = new mongoose_1.Schema({
    // 和你的資料庫一致：以字串保存 ObjectId（方便直接回傳給前端用）
    gameCategoryId: { type: String, required: true, index: true },
    questionId: { type: String, required: true, index: true },
    // 音檔內容（二進位），通常不直接回傳前端，只在串流/快取時使用
    audioData: { type: Buffer },
    originalFilename: { type: String, required: true },
    audioType: { type: String, enum: ["question"], required: true },
    fileSize: { type: Number, required: true },
    duration: { type: Number, required: true },
    isActive: { type: Boolean, default: true },
}, {
    collection: "GameAudio",
    timestamps: true,
});
// 需要同時查 questionId + 類型時可用複合索引（可選）
gameAudioSchema.index({ questionId: 1, audioType: 1 });
// 避免 OverwriteModelError
exports.GameAudioModel = mongoose_1.models.GameAudio ||
    (0, mongoose_1.model)("GameAudio", gameAudioSchema);

// src/orm/schemas/gameAudioSchemas.ts
import { Schema, model, models, Model } from "mongoose";
import type { GameAudio } from "../../interfaces/GameAudio";

const gameAudioSchema = new Schema<GameAudio>(
  {
    // 和你的資料庫一致：以字串保存 ObjectId（方便直接回傳給前端用）
    gameCategoryId: { type: String, required: true, index: true }, // 對應 GameCategories._id
    questionId:     { type: String, required: true, index: true }, // 對應 GameQuestions._id

    // 音檔內容（二進位），通常不直接回傳前端，只在串流/快取時使用
    audioData: { type: Buffer },

    originalFilename: { type: String, required: true },             // e.g. "第一題_1756326247.wav"
    audioType:        { type: String, enum: ["question"], required: true }, // 目前只有 question
    fileSize:         { type: Number, required: true },             // bytes
    duration:         { type: Number, required: true },             // 秒，允許小數
    isActive:         { type: Boolean, default: true },

  },
  {
    collection: "GameAudio",
    timestamps: true,
  }
);

// 需要同時查 questionId + 類型時可用複合索引（可選）
gameAudioSchema.index({ questionId: 1, audioType: 1 });

// 避免 OverwriteModelError
export const GameAudioModel: Model<GameAudio> =
  (models.GameAudio as Model<GameAudio>) ||
  model<GameAudio>("GameAudio", gameAudioSchema);
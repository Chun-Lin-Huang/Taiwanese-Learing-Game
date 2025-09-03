import { Schema, model, models, Model } from "mongoose";
import type { SentenceAudio } from "../../interfaces/SentenceAudio";

const sentenceAudioSchema = new Schema<SentenceAudio>(
  {
    //（選填）用來標示來源用的欄位
    word:          { type: String },
    sentenceIndex: { type: Number },
    category:      { type: String },

    // 音檔本體與資訊
    audioData:        { type: Buffer },                 // 直接存 binary
    originalFilename: { type: String, required: true }, // 例：公車_例句_06.wav
    contentType:      { type: String, default: "audio/wav" },
    fileSize:         { type: Number },
    duration:         { type: Number, default: null },
    audioType:        { type: String, default: "sentence" },
    isActive:         { type: Boolean, default: true },
  },
  {
    collection: "SentenceAudio", // ← 若實際集合名不同，這裡改掉
    timestamps: true,
  }
);

// 常用查詢索引
sentenceAudioSchema.index({ isActive: 1, category: 1 });
sentenceAudioSchema.index({ isActive: 1, sentenceIndex: 1 });

export const SentenceAudioModel: Model<SentenceAudio> =
  (models.SentenceAudio as Model<SentenceAudio>) ||
  model<SentenceAudio>("SentenceAudio", sentenceAudioSchema);
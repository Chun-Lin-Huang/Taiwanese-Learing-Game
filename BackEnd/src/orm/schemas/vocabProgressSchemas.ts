// src/orm/schemas/vocabProgressSchemas.ts
import { Schema, model, models, Model } from "mongoose";
import type { VocabProgress } from "../../interfaces/VocabProgress";

const vocabProgressSchema = new Schema<VocabProgress>(
  {
    userId:      { type: String, required: true, index: true, trim: true },
    categoryId:  { type: String, required: true, index: true, trim: true },
    currentIndex:{ type: Number, required: true, min: 0, default: 0 },
  },
  { collection: "VocabProgress", timestamps: true }
);

// 每個 userId × categoryId 僅一筆
vocabProgressSchema.index({ userId: 1, categoryId: 1 }, { unique: true });

export const VocabProgressModel: Model<VocabProgress> =
  (models.VocabProgress as Model<VocabProgress>) ||
  model<VocabProgress>("VocabProgress", vocabProgressSchema);
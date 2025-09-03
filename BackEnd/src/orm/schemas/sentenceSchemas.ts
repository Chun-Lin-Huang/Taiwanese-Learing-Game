// src/orm/schemas/sentenceSchemas.ts
import { Schema, model, models, Model } from "mongoose";
import type { Sentence } from "../../interfaces/Sentence";

const sentenceSchema = new Schema<Sentence>(
  {
    cardId:       { type: String, required: true, index: true }, // ★ 改成 String
    chinese:      { type: String, required: true },
    han:          { type: String, required: true },
    tl:           { type: String, required: true },

    audioFileId:  { type: String },   // 對應 VocabularyAudio._id 或 Buffer 存的檔案
    audioFilename:{ type: String },
    source:       { type: String },

  },
  { collection: "Sentence", timestamps: true }
);

sentenceSchema.index({ isActive: 1, cardId: 1 });

export const SentenceModel: Model<Sentence> =
  (models.Sentences as Model<Sentence>) ||
  model<Sentence>("Sentence", sentenceSchema);
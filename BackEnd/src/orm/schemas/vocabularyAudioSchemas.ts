// src/orm/schemas/vocabularyAudioSchemas.ts
import { Schema, model, models, Model, Types } from "mongoose";
import type { VocabularyAudio } from "../../interfaces/VocabularyAudio";

const vocabAudioSchema = new Schema<VocabularyAudio>(
  {
    vocId:         { type: Schema.Types.ObjectId, ref: "VocabularyCards", required: true, index: true },
    vocCategoryId: { type: Schema.Types.ObjectId, ref: "VocabularyCategories", required: true, index: true },

    audioFileName: { type: String, required: true },
    contentType:   { type: String, default: "audio/wav" },
    fileSize:      { type: Number },
    duration:      { type: Number, default: null },
    audioType:     { type: String, default: "vocabulary" },
    isActive:      { type: Boolean, default: true },

    audioData:     { type: Buffer },
  },
  { collection: "VocabularyAudio" }
);

vocabAudioSchema.index({ isActive: 1, vocId: 1 });
vocabAudioSchema.index({ isActive: 1, vocCategoryId: 1 });

export const VocabularyAudioModel: Model<VocabularyAudio> =
  (models.VocabularyAudio as Model<VocabularyAudio>) ||
  model<VocabularyAudio>("VocabularyAudio", vocabAudioSchema);
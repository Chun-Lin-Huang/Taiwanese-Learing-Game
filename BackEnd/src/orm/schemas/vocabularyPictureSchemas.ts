// src/orm/schemas/vocabularyPictureSchemas.ts
import { Schema, model, models, Model } from "mongoose";
import type { VocabularyPicture } from "../../interfaces/VocabularyPicture";

const vocabPictureSchema = new Schema<VocabularyPicture>(
  {
    imageFileName: { type: String, required: true },
    imageSize: { type: Number, required: true },
    imageType: { type: String, required: true },
    image: { type: Buffer, required: true },
    vocId: { type: Schema.Types.Mixed, required: true, index: true }, // 支援 ObjectId 和 String
  },
  { collection: "VocabularyPicture", timestamps: true }
);

vocabPictureSchema.index({ vocId: 1 });

export const VocabularyPictureModel: Model<VocabularyPicture> =
  (models.VocabularyPicture as Model<VocabularyPicture>) ||
  model<VocabularyPicture>("VocabularyPicture", vocabPictureSchema);

// src/orm/schemas/vocabularyCategorySchemas.ts
import { Schema, model, models, Model } from "mongoose";
import type { VocabularyCategories } from "../../interfaces/VocabularyCategories";

const vocabCategorySchema = new Schema<VocabularyCategories>(
  {
    name: { type: String, required: true, index: true },
    image: { type: Buffer },         // ← 對應 image (Binary)
    imageFilename: { type: String },
    imageSize: { type: Number },
    imageType: { type: String },     // e.g. "image/png"
  },
  { collection: "VocabularyCategories", timestamps: false }
);

vocabCategorySchema.index({ name: 1 });

export const VocabularyCategoryModel: Model<VocabularyCategories> =
  (models.VocabularyCategories as Model<VocabularyCategories>) ||
  model<VocabularyCategories>("VocabularyCategories", vocabCategorySchema);
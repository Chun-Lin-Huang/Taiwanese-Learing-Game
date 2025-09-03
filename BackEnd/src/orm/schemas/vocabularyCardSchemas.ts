import { Schema, model, models, Model } from "mongoose";
import type { VocabularyCard } from "../../interfaces/VocabularyCard";

const vocabCardSchema = new Schema<VocabularyCard>(
  {
    han:         { type: String, required: true },
    tl:          { type: String, required: true },
    ch:          { type: String, required: true },
    category_id: { type: Schema.Types.ObjectId, ref: "VocabularyCategories", required: true, index: true },
    audio_file_id:   { type: Schema.Types.ObjectId, ref: "VocabularyAudio" },
    audio_filename:  { type: String },
  },
  { collection: "VocabularyCards", timestamps: true }
);

vocabCardSchema.index({ category_id: 1, han: 1 });

export const VocabularyCardModel: Model<VocabularyCard> =
  (models.VocabularyCards as Model<VocabularyCard>) ||
  model<VocabularyCard>("VocabularyCards", vocabCardSchema);
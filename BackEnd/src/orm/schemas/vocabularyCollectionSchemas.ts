// src/orm/schemas/vocabularyCollectionSchemas.ts
import { Schema, model, models, Model, Types } from "mongoose";
import type { VocabularyCollection } from "../../interfaces/VocabularyCollection";

const itemSchema = new Schema(
  {
    id:      { type: Schema.Types.ObjectId, ref: "VocabularyCards", required: true, index: true },
    han:     { type: String },
    tl:      { type: String },
    ch:      { type: String },
    addedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const vocabColSchema = new Schema<VocabularyCollection>(
  {
    user_id:    { type: Schema.Types.ObjectId, ref: "Users", required: true, index: true },
    vocabulary: { type: [itemSchema], default: [] },
    addTime:    { type: Date, default: Date.now },
  },
  { collection: "VocabularyCollection" }
);

vocabColSchema.index({ user_id: 1, "vocabulary.id": 1 }, { unique: false });

export const VocabularyCollectionModel: Model<VocabularyCollection> =
  (models.VocabularyCollection as Model<VocabularyCollection>) ||
  model<VocabularyCollection>("VocabularyCollection", vocabColSchema);
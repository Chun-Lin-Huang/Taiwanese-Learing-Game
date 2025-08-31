import { Schema, model, models, Model } from "mongoose";
import type { StoryName } from "../../interfaces/StoryName";

const storyNameSchema = new Schema<StoryName>(
  {
    name: { type: String, required: true, index: true },
    imageFilename: { type: String },
    imageData: { type: Buffer },
    imageSize: { type: Number },
    isActive: { type: Boolean, default: true },
  },
  { collection: "StoryName", timestamps: true }
);

export const StoryNameModel: Model<StoryName> =
  (models.StoryName as Model<StoryName>) ||
  model<StoryName>("StoryName", storyNameSchema);
import { Schema, model, models, Model } from "mongoose";
import type { Story } from "../../interfaces/Story";

const storySchema = new Schema<Story>(
  {
    storyNameId: { type: String, required: true, index: true },
    chinese: { type: String, required: true },
    han: { type: String, required: true },
    imageFilename: { type: String },
  },
  { collection: "Story", timestamps: true }
);

export const StoryModel: Model<Story> =
  (models.Story as Model<Story>) ||
  model<Story>("Story", storySchema);
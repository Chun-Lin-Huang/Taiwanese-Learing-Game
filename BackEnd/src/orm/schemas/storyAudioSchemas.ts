import { Schema, model, models, Model } from "mongoose";
import type { StoryAudio } from "../../interfaces/StoryAudio";

const storyAudioSchema = new Schema<StoryAudio>(
  {
    storyName: { type: String, required: true, index: true },
    audioData: { type: Buffer },
    originalFilename: { type: String, required: true },
    audioType: { type: String, enum: ["story"], required: true },
    fileSize: { type: Number, required: true },
    duration: { type: Number, required: true },
    isActive: { type: Boolean, default: true },
  },
  { collection: "StoryAudio", timestamps: true }
);

export const StoryAudioModel: Model<StoryAudio> =
  (models.StoryAudio as Model<StoryAudio>) ||
  model<StoryAudio>("StoryAudio", storyAudioSchema);
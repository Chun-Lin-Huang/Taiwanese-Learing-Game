// src/orm/schemas/StoryCollectionSchemas.ts
import { Schema, model } from "mongoose";
import type { StoryCollection } from "../../interfaces/StoryCollection";

const storyCollectionSchema = new Schema(
  {
    user_id: { type: Schema.Types.ObjectId, ref: "Users", required: true, index: true },
    storyNames: [
      {
        _id: { type: Schema.Types.ObjectId, ref: "StoryName", required: true },
        name: { type: String, required: true },
        imageFilename: { type: String },
        imageSize: { type: Number },
      },
    ],
    addTime: { type: Date, default: Date.now },
  },
  { collection: "StoryCollection" }
);

export const StoryCollectionModel = model<StoryCollection>(
  "StoryCollection",
  storyCollectionSchema
);
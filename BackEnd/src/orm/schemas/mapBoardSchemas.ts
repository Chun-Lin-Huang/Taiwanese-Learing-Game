// src/orm/schemas/mapBoardSchemas.ts
import { Schema, model, models, Document } from "mongoose";

export interface IMapBoardDoc extends Document {
  name: string;
  image?: {
    url?: string;
    filename?: string;
    size?: number;
    mimeType?: string;
  };
  start_node: string;
  max_players: number;
  version: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const mapBoardSchema = new Schema<IMapBoardDoc>(
  {
    name: { type: String, required: true, trim: true },
    image: {
      url: { type: String },
      filename: { type: String },
      size: { type: Number },
      mimeType: { type: String }
    },
    start_node: { type: String, required: true, trim: true },
    max_players: { type: Number, required: true, min: 2, max: 8 },
    version: { type: Number, required: true, default: 1 }
  },
  { timestamps: true, collection: "MapBoards" }
);

// 索引優化
mapBoardSchema.index({ name: 1 });
mapBoardSchema.index({ version: 1 });
mapBoardSchema.index({ start_node: 1 });

export const MapBoardModel = (models.MapBoards as any) || model<IMapBoardDoc>("MapBoards", mapBoardSchema);

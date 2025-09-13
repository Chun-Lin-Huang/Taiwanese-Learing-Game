// src/orm/schemas/mapEdgeSchemas.ts
import { Schema, model, models, Document, Types } from "mongoose";

export interface IMapEdgeDoc extends Document {
  from: string;
  to: string;
  type: 'normal' | 'shortcut' | 'branch' | 'conditional';
  board_id: Types.ObjectId | string; // 支援 ObjectId 和 String
  condition?: {
    required_challenge?: string;
    required_item?: string;
  };
  createdAt?: Date;
  updatedAt?: Date;
}

const mapEdgeSchema = new Schema<IMapEdgeDoc>(
  {
    from: { type: String, required: true, trim: true },
    to: { type: String, required: true, trim: true },
    type: { 
      type: String, 
      required: true, 
      enum: ['normal', 'shortcut', 'branch', 'conditional'],
      default: 'normal'
    },
    board_id: { type: Schema.Types.Mixed, required: true }, // 支援 ObjectId 和 String
    
    condition: {
      required_challenge: { type: String },
      required_item: { type: String }
    }
  },
  { timestamps: true, collection: "MapEdges" }
);

// 複合索引優化
mapEdgeSchema.index({ board_id: 1, from: 1 });
mapEdgeSchema.index({ board_id: 1, to: 1 });
mapEdgeSchema.index({ board_id: 1, type: 1 });
mapEdgeSchema.index({ from: 1, to: 1 });

export const MapEdgeModel = (models.MapEdges as any) || model<IMapEdgeDoc>("MapEdges", mapEdgeSchema);

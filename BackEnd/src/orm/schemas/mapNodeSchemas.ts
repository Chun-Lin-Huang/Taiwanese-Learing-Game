// src/orm/schemas/mapNodeSchemas.ts
import { Schema, model, models, Document, Types } from "mongoose";

export interface IMapNodeDoc extends Document {
  node_id: string;
  board_id: Types.ObjectId | string; // 支援 ObjectId 和 String
  name: string;
  type: 'start' | 'property' | 'challenge' | 'chance' | 'special' | 'shortcut';
  description?: string;
  
  // 挑戰相關欄位
  challenge?: {
    type: 'vocabulary' | 'culture' | 'story' | 'action' | 'train';
    title: string;
    content: string;
    reward: string;
  };
  
  // 機會卡相關欄位
  chance?: {
    type: 'positive' | 'negative' | 'neutral';
    title: string;
    content: string;
    effect: string;
  };
  
  // 捷徑相關欄位
  shortcut?: {
    target: string;
    description: string;
  };
  
  // 地產相關欄位
  property?: {
    price?: number;
    rent?: number;
    color?: string;
  };
  
  createdAt?: Date;
  updatedAt?: Date;
}

const mapNodeSchema = new Schema<IMapNodeDoc>(
  {
    node_id: { type: String, required: true, trim: true },
    board_id: { type: Schema.Types.Mixed, required: true }, // 支援 ObjectId 和 String
    name: { type: String, required: true, trim: true },
    type: { 
      type: String, 
      required: true, 
      enum: ['start', 'property', 'challenge', 'chance', 'special', 'shortcut'] 
    },
    description: { type: String },
    
    challenge: {
      type: { 
        type: String, 
        enum: ['vocabulary', 'culture', 'story', 'action', 'train'] 
      },
      title: { type: String },
      content: { type: String },
      reward: { type: String }
    },
    
    chance: {
      type: { 
        type: String, 
        enum: ['positive', 'negative', 'neutral'] 
      },
      title: { type: String },
      content: { type: String },
      effect: { type: String }
    },
    
    shortcut: {
      target: { type: String },
      description: { type: String }
    },
    
    property: {
      price: { type: Number },
      rent: { type: Number },
      color: { type: String }
    }
  },
  { timestamps: true, collection: "MapNodes" }
);

// 複合索引優化
mapNodeSchema.index({ board_id: 1, node_id: 1 }, { unique: true });
mapNodeSchema.index({ board_id: 1, type: 1 });
mapNodeSchema.index({ node_id: 1 });

export const MapNodeModel = (models.MapNodes as any) || model<IMapNodeDoc>("MapNodes", mapNodeSchema);

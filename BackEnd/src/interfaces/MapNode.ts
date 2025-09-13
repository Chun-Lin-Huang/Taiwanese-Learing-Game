import { Types } from "mongoose";

export interface MapNode {
  _id?: string;
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
    target: string; // 跳轉到的節點 ID
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

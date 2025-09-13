import { Types } from "mongoose";

export interface MapEdge {
  _id?: string;
  from: string; // 起始節點 ID
  to: string; // 目標節點 ID
  type: 'normal' | 'shortcut' | 'branch' | 'conditional';
  board_id: Types.ObjectId | string; // 支援 ObjectId 和 String
  condition?: {
    required_challenge?: string; // 需要完成的挑戰類型
    required_item?: string; // 需要的道具
  };
  createdAt?: Date;
  updatedAt?: Date;
}

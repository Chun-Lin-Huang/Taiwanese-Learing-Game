import { Schema, model, Document } from "mongoose";
import { Room } from "../../interfaces/Room";

interface RoomDoc extends Document {
  roomCode: string;
  gameName: string;
  maxPlayers: number;
  currentPlayers: number;
  players: Array<{
    id: number;
    name: string;
    userName?: string;
    isReady: boolean;
  }>;
  boardId?: string;
  status: 'waiting' | 'in_progress' | 'completed' | 'abandoned';
  expiresAt?: Date;
}

const RoomSchema = new Schema<RoomDoc>({
  roomCode: { 
    type: String, 
    required: true, 
    unique: true, 
    index: true,
    length: 6,
    match: /^\d{6}$/  // 確保是6位數字
  },
  gameName: { type: String, required: true },
  maxPlayers: { type: Number, required: true, min: 2, max: 4 },
  currentPlayers: { type: Number, required: true, default: 0, min: 0 },
  players: [{
    id: { type: Number, required: true },
    name: { type: String, required: true },
    userName: { type: String },
    isReady: { type: Boolean, default: false }
  }],
  boardId: { type: String },
  status: { 
    type: String, 
    enum: ['waiting', 'in_progress', 'completed', 'abandoned'], 
    default: 'waiting' 
  },
  expiresAt: { type: Date }
}, {
  collection: "Rooms",
  timestamps: true
});

// 建立索引以提升查詢效能
RoomSchema.index({ roomCode: 1 });
RoomSchema.index({ status: 1 });
RoomSchema.index({ createdAt: -1 });
RoomSchema.index({ expiresAt: 1 });

// 自動清理過期房間的 TTL 索引（24小時後過期）
RoomSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const RoomModel = model<RoomDoc>("Room", RoomSchema, "Rooms");

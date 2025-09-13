import { Schema, model, Document } from "mongoose";
import { GameHistory, GameAction } from "../../interfaces/GameHistory";

interface GameActionDoc extends Document {
  actionType: 'dice_roll' | 'move' | 'challenge' | 'bankruptcy' | 'shortcut' | 'victory';
  playerId: number;
  playerName: string;
  description: string;
  details?: any;
  timestamp: Date;
}

interface GameHistoryDoc extends Document {
  gameId: string;
  gameName: string;
  boardId: Schema.Types.ObjectId;
  players: Array<{
    id: number;
    name: string;
    userName?: string;
    finalScore?: number;
    finalRound?: number;
  }>;
  actions: GameActionDoc[];
  startTime: Date;
  endTime?: Date;
  winner?: {
    playerId: number;
    playerName: string;
    reason: string;
  };
  gameStatus: 'in_progress' | 'completed' | 'abandoned';
  totalRounds?: number;
}

const GameActionSchema = new Schema<GameActionDoc>({
  actionType: { 
    type: String, 
    enum: ['dice_roll', 'move', 'challenge', 'bankruptcy', 'shortcut', 'victory'], 
    required: true 
  },
  playerId: { type: Number, required: true },
  playerName: { type: String, required: true },
  description: { type: String, required: true },
  details: { type: Schema.Types.Mixed },
  timestamp: { type: Date, default: Date.now }
}, { _id: true });

const GameHistorySchema = new Schema<GameHistoryDoc>({
  gameId: { type: String, required: true, unique: true, index: true },
  gameName: { type: String, required: true },
  boardId: { type: Schema.Types.ObjectId, required: false, ref: "MapBoard" },
  players: [{
    id: { type: Number, required: true },
    name: { type: String, required: true },
    userName: { type: String },
    finalScore: { type: Number },
    finalRound: { type: Number }
  }],
  actions: [GameActionSchema],
  startTime: { type: Date, required: true, default: Date.now },
  endTime: { type: Date },
  winner: {
    playerId: { type: Number },
    playerName: { type: String },
    reason: { type: String }
  },
  gameStatus: { 
    type: String, 
    enum: ['in_progress', 'completed', 'abandoned'], 
    default: 'in_progress' 
  },
  totalRounds: { type: Number }
}, {
  collection: "GameHistory",
  timestamps: true
});

// 建立索引以提升查詢效能
GameHistorySchema.index({ gameId: 1 });
GameHistorySchema.index({ boardId: 1 });
GameHistorySchema.index({ gameStatus: 1 });
GameHistorySchema.index({ startTime: -1 });
GameHistorySchema.index({ 'players.id': 1 });

export const GameHistoryModel = model<GameHistoryDoc>("GameHistory", GameHistorySchema, "GameHistory");

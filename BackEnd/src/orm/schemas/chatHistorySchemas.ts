import { Schema, model, Document, Types } from "mongoose";

interface ChatMessageDoc extends Document {
  role: "user" | "assistant";
  text: string;
  ts?: Date;
}

interface ChatHistoryDoc extends Document {
  session_id: string;
  userId: Types.ObjectId;       // 👈 新增
  chatChooseId: Types.ObjectId;
  title: string;
  score: number;
  turn: number;
  finished: boolean;
  history: ChatMessageDoc[];
}

const ChatMessageSchema = new Schema<ChatMessageDoc>({
  role: { type: String, enum: ["user", "assistant"], required: true },
  text: { type: String, required: true },
  ts: { type: Date, default: Date.now },
}, { _id: false });

const ChatHistorySchema = new Schema<ChatHistoryDoc>({
  session_id: { type: String, required: true, unique: true, index: true },
  userId: { type: Schema.Types.ObjectId, required: true, index: true, ref: "Users" }, // 👈 新增
  chatChooseId: { type: Schema.Types.ObjectId, required: true, index: true, ref: "ChatChoose" },
  title: { type: String, required: true },
  score: { type: Number, default: 0 },
  turn: { type: Number, default: 1 },
  finished: { type: Boolean, default: false },
  history: { type: [ChatMessageSchema], default: [] },
}, {
  collection: "ChatHistory",
  timestamps: true
});

export const ChatHistoryModel = model<ChatHistoryDoc>("ChatHistory", ChatHistorySchema, "ChatHistory");
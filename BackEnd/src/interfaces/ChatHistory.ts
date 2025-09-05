import { Types } from "mongoose";

export type ChatRole = "user" | "assistant";

export interface ChatMessage {
  role: ChatRole;
  text: string;
  ts?: Date;
}

export interface ChatHistory {
  _id?: string;
  session_id: string;          // 系統產的 session id
  userId: Types.ObjectId;      // 👈 新增：對應 Users 表
  chatChooseId: Types.ObjectId;
  title: string;
  score: number;
  turn: number;
  finished: boolean;
  history: ChatMessage[];
}
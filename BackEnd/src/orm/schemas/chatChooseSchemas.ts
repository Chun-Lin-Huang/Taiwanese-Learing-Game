import { Schema, model, Document } from "mongoose";
import type { ChatChoose } from "../../interfaces/ChatChoose";

export interface ChatChooseDoc extends Document, Omit<ChatChoose, "_id"> { }

const chatChooseSchema = new Schema<ChatChooseDoc>({
  name: { type: String, required: true },
}, {
  collection: "ChatChoose",
});

// 第三個參數指定 collection 名稱 = "ChatChoose" (依你 DB 實際名稱)
export const ChatChooseModel = model<ChatChooseDoc>(
  "ChatChoose",
  chatChooseSchema,
  "ChatChoose"
);
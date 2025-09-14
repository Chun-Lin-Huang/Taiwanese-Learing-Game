import mongoose, { Schema, Document } from "mongoose";

export interface Card extends Document {
  _id: string;
  code: string;
  type: "reward" | "penalty" | "chance";
  description: string;
  action: "move" | "teleport" | "skip" | "money" | "item";
  value: number | string;
}

const CardSchema = new Schema<Card>({}, { 
  strict: false,
  collection: 'QRcode'
});

export const CardModel = mongoose.model<Card>("QRcode", CardSchema);

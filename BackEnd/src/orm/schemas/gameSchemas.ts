import { Schema, model } from "mongoose";
import type { Game } from "../../interfaces/Game";

export const gameSchema = new Schema<Game>(
  {
    name: { type: String, required: true, trim: true },   // 遊戲名稱
    categoryId: { type: String, required: true },         // 對應 GameCategories._id
    questionCount: { type: Number, required: true },      // 題目數量
  },
  {
    collection: "Game"                          // 存到 GameCategories 集合
  }
);

export const GameCategoryModel = model<Game>(
  "Game",
  gameSchema
);

export const GameModel = model<Game>("Game", gameSchema);
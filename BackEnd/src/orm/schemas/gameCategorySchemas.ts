// src/orm/schemas/gameCategorySchemas.ts
import { Schema, model } from "mongoose";
import type { GameCategories } from "../../interfaces/GameCategories";

export const gameCategorySchema = new Schema<GameCategories>(
  {
    name: { type: String, required: true, trim: true },   // 類別名稱
    isActive: { type: Boolean, default: true },           // 是否啟用
  },
  {
    collection: "GameCategories"                          // 存到 GameCategories 集合
  }
);

export const GameCategoryModel = model<GameCategories>(
  "GameCategories",
  gameCategorySchema
);
// src/orm/schemas/gameQuestionsSchemas.ts
import { Schema, model } from "mongoose";
import type { GameQuestions } from "../../interfaces/GameQuestions";

export const GameQuestionsSchemas = new Schema<GameQuestions>({
  gameId: { type: String, required: true },      // ✅ 字串
  text: { type: String, required: true },
  options: { type: [String], required: true },
  correctAnswer: { type: String, required: true },
}, { collection: "GameQuestions", timestamps: true });

export const GameQuestionModel = model<GameQuestions>(
  "GameQuestions",
  GameQuestionsSchemas
);
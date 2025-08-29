"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameQuestionModel = exports.GameQuestionsSchemas = void 0;
// src/orm/schemas/gameQuestionsSchemas.ts
const mongoose_1 = require("mongoose");
exports.GameQuestionsSchemas = new mongoose_1.Schema({
    gameId: { type: String, required: true },
    text: { type: String, required: true },
    options: { type: [String], required: true },
    correctAnswer: { type: String, required: true },
}, { collection: "GameQuestions", timestamps: true });
exports.GameQuestionModel = (0, mongoose_1.model)("GameQuestions", exports.GameQuestionsSchemas);

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameModel = exports.GameCategoryModel = exports.gameSchema = void 0;
const mongoose_1 = require("mongoose");
exports.gameSchema = new mongoose_1.Schema({
    name: { type: String, required: true, trim: true },
    categoryId: { type: String, required: true },
    questionCount: { type: Number, required: true }, // 題目數量
}, {
    collection: "Game" // 存到 GameCategories 集合
});
exports.GameCategoryModel = (0, mongoose_1.model)("Game", exports.gameSchema);
exports.GameModel = (0, mongoose_1.model)("Game", exports.gameSchema);

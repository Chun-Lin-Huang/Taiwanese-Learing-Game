"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameCategoryModel = exports.gameCategorySchema = void 0;
// src/orm/schemas/gameCategorySchemas.ts
const mongoose_1 = require("mongoose");
exports.gameCategorySchema = new mongoose_1.Schema({
    name: { type: String, required: true, trim: true },
    isActive: { type: Boolean, default: true }, // 是否啟用
}, {
    collection: "GameCategories" // 存到 GameCategories 集合
});
exports.GameCategoryModel = (0, mongoose_1.model)("GameCategories", exports.gameCategorySchema);

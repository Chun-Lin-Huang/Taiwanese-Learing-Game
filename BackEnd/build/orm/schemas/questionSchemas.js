"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuestionModel = exports.questionSchema = void 0;
const mongoose_1 = require("mongoose");
exports.questionSchema = new mongoose_1.Schema({
    userName: { type: String, required: true, trim: true, lowercase: true },
    questionText: { type: String, required: true, trim: true },
}, { timestamps: true,
    collection: 'Questions'
});
exports.QuestionModel = (0, mongoose_1.model)("Questions", exports.questionSchema);

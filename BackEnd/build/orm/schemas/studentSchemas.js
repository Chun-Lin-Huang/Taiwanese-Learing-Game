"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.studentsModel = exports.studentsSchemas = void 0;
const mongoose_1 = require("mongoose");
exports.studentsSchemas = new mongoose_1.Schema({
    userName: { type: String, required: true },
    sid: { type: String, required: true },
    name: { type: String, required: true },
    department: { type: String, required: true },
    grade: { type: String, required: true },
    class: { type: String, required: true },
    Email: { type: String, required: true },
    absences: { type: Number, required: false },
});
exports.studentsModel = (0, mongoose_1.model)('students', exports.studentsSchemas);

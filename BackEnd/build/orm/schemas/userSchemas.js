"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userModel = exports.userSchemas = void 0;
const mongoose_1 = require("mongoose");
exports.userSchemas = new mongoose_1.Schema({
    name: { type: String, required: true },
    userName: { type: String, required: true },
    password: { type: String, required: true },
}, { timestamps: true,
    collection: 'Users'
});
exports.userModel = (0, mongoose_1.model)('Users', exports.userSchemas);

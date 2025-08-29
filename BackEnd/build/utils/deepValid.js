"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deepValid = void 0;
const deepValid = (v1, v2, keys) => {
    let isValid = true;
    keys.forEach((key) => {
        if (v1[key] != v2[key]) {
            isValid = false;
        }
    });
    return isValid;
};
exports.deepValid = deepValid;

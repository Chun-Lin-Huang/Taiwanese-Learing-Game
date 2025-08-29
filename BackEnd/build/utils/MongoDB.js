"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MongoDB = void 0;
const mongoose_1 = require("mongoose");
const log_1 = require("../middlewares/log");
class MongoDB {
    constructor(info) {
        this.isConneted = false;
        const url = `mongodb://${info.name}:${encodeURIComponent(info.password)}@${info.host}:${info.port}/${info.dbName}`;
        this.init(url).then(() => {
            log_1.logger.info(`suscess: connet to mongoDB @${url}`);
            this.isConneted = true;
        }).catch(() => {
            log_1.logger.error(`error: cannt connet to mongoDB @${url}`);
        });
    }
    init(url) {
        return __awaiter(this, void 0, void 0, function* () {
            this.DB = yield (0, mongoose_1.connect)(url).catch(err => {
                log_1.logger.error(`error: cannt connet to mongoDB ${err}`);
            });
        });
    }
    getState() {
        return this.isConneted;
    }
}
exports.MongoDB = MongoDB;

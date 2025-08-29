"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const pageRoute_1 = require("./routers/pageRoute");
const UserRoute_1 = require("./routers/UserRoute");
const QuestionRoute_1 = require("./routers/QuestionRoute");
const GameCategoryRoute_1 = require("./routers/GameCategoryRoute");
const GameRoute_1 = require("./routers/GameRoute");
const GameQuestionRoute_1 = require("./routers/GameQuestionRoute");
const AudioRoute_1 = require("./routers/AudioRoute");
exports.router = [
    new pageRoute_1.PageRoute(), new UserRoute_1.UserRoute(),
    new QuestionRoute_1.QuestionRoute(),
    new GameCategoryRoute_1.GameCategoryRoute(),
    new GameRoute_1.GameRoute(),
    new GameQuestionRoute_1.GameQuestionRoute(),
    new AudioRoute_1.AudioRoute()
];

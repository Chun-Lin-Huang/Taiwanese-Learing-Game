import {Route} from "./abstract/Route";
import { PageRoute } from "./routers/pageRoute";
import { UserRoute } from "./routers/UserRoute";
import { QuestionRoute } from "./routers/QuestionRoute";
import { GameCategoryRoute } from "./routers/GameCategoryRoute";
import { GameRoute } from "./routers/GameRoute";
import { GameQuestionRoute } from "./routers/GameQuestionRoute";
import { AudioRoute } from "./routers/AudioRoute";

export const router: Array<Route> = [
    new PageRoute(),new UserRoute()
    ,new QuestionRoute()
    ,new GameCategoryRoute()
    ,new GameRoute()
    ,new GameQuestionRoute()
    ,new AudioRoute()
];
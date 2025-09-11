import {Route} from "./abstract/Route";
import { PageRoute } from "./routers/pageRoute";
import { UserRoute } from "./routers/UserRoute";
import { QuestionRoute } from "./routers/QuestionRoute";
import { GameCategoryRoute } from "./routers/GameCategoryRoute";
import { GameRoute } from "./routers/GameRoute";
import { GameQuestionRoute } from "./routers/GameQuestionRoute";
import { AudioRoute } from "./routers/AudioRoute";
import { StoryNameRoute } from "./routers/StoryNameRoute";
import { StoryRoute } from "./routers/StoryRoute";
import { StoryAudioRoute } from "./routers/StoryAudioRoute";
import { StoryCollectionRoute } from "./routers/StroyCollectionRoute";
import { VocabularyCategoryRoute } from "./routers/VocabularyCategoryRoute";
import { VocabularyCardRoute } from "./routers/VocabilaryCardRoute";
import { VocabularyAudioRoute } from "./routers/VocabularyAudioRoute";
import { SentenceRoute } from "./routers/SentenceRoute";
import { SentenceAudioRoute } from "./routers/SentenceAudioRoute";
import { VocabularyCollectionRoute } from "./routers/VocabularyCollectionRoute";
import { ChatChooseRoute } from "./routers/ChatChooseRoute";
import { ScenarioRoute } from "./routers/ScenarioRoute";
import { VocabProgressRoute } from "./routers/VocabProgressRoute";
import { VocabularyPictureRoute } from "./routers/VocabularyPictureRoute";

export const router: Array<Route> = [
    new PageRoute(),new UserRoute()
    ,new QuestionRoute()
    ,new GameCategoryRoute()
    ,new GameRoute()
    ,new GameQuestionRoute()
    ,new AudioRoute()
    ,new StoryNameRoute()
    ,new StoryRoute()
    ,new StoryAudioRoute()
    ,new StoryCollectionRoute()
    ,new VocabularyCategoryRoute()
    ,new VocabularyCardRoute()
    ,new VocabularyAudioRoute()
    ,new SentenceRoute()
    ,new SentenceAudioRoute()
    ,new VocabularyCollectionRoute()
    ,new ChatChooseRoute()
    ,new ScenarioRoute()
    ,new VocabProgressRoute()
    ,new VocabularyPictureRoute()
];
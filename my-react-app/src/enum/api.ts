export enum api {
    login = "http://127.0.0.1:2083/api/v1/user/login",
    register = "http://127.0.0.1:2083/api/v1/user/insertOne",
    update = "http://127.0.0.1:2083/api/v1/user/updateById",
    Question = "http://127.0.0.1:2083/api/v1/question/create",
    categoryIdByName = "http://127.0.0.1:2083/api/v1/game-categories/id-by-name",
    latestGameByCategory = "http://127.0.0.1:2083/api/v1/game/by-category",
    gameQuestionsByGame = "http://127.0.0.1:2083/api/v1/game-questions/by-game",
    audioByQuestion = "http://127.0.0.1:2083/api/v1/audio/by-question",
}
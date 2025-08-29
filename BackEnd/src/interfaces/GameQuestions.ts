export interface GameQuestions {
    _id?: string;           // 題目唯一識別碼
    gameId: string;        // 對應 Game._id
    text: string;  // 題目文字
    options: string[];     // 選項
    correctAnswer: string; // 正確答案
}
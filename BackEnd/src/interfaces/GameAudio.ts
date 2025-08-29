export interface GameAudio {
  _id?: string;                // 音檔唯一識別碼
  gameCategoryId: string;      // 對應 GameCategories._id
  questionId: string;          // 對應 GameQuestions._id
  audioData?: Buffer;          // 音檔二進位資料（通常不直接回傳前端）
  originalFilename: string;    // 檔名，例如 "第一題_1756326247.wav"
  audioType: "question"; // 音檔類型
  fileSize: number;            // 檔案大小（byte）
  duration: number;            // 播放長度（秒）
  isActive: boolean;           // 是否啟用
}
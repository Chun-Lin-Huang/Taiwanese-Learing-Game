// src/interfaces/StoryAudio.ts
export interface StoryAudio {
  _id?: string;              // 音檔唯一識別碼
  storyName: string;         // 對應故事名稱（文字）
  audioData?: Buffer;        // 音檔二進位資料
  originalFilename: string;  // 檔名
  audioType: "story";        // 類型
  fileSize: number;          // 檔案大小
  duration: number;          // 播放秒數
  isActive: boolean;         // 是否啟用
}
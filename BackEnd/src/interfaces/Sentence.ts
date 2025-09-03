// src/interfaces/Sentence.ts
import { Types } from "mongoose";

export interface Sentence {
  _id?: string;

  // 關聯
  cardId: string;     // 對應 VocabularyCard._id

  // 內容
  chinese: string;            // 中文例句
  han: string;                // 漢字
  tl: string;                 // 台羅拼音

  // 音檔關聯
  audioFileId?: Types.ObjectId;  // 對應 SentenceAudio._id
  audioFilename?: string;        // 原始檔名

  // 其他
  source?: string;               // 來源（如匯入報告檔案名）
}
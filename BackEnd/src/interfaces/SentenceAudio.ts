// src/interfaces/SentenceAudio.ts
import { Types } from "mongoose";

export interface SentenceAudio {
  _id?: string;

  // 關聯
  word?: string;               // 對應的單字（非必填，主要看 cardId）
  sentenceIndex?: number;      // 第幾個例句
  category?: string;           // 所屬分類，例如「交通工具」

  // 音檔資訊
  audioData?: Buffer;          // 二進位音檔（如果直接存 DB）
  originalFilename: string;    // 檔名（如 公車_例句_06.wav）
  contentType?: string;        // "audio/wav"
  fileSize?: number;           // 檔案大小
  duration?: number | null;    // 秒數
  audioType?: "sentence" | string;
  isActive?: boolean;
}
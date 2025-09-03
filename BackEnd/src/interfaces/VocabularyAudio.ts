// src/interfaces/VocabularyAudio.ts
import { Types } from "mongoose";

export interface VocabularyAudio {
  _id?: string;

  // 關聯（真正是 ObjectId）
  vocId: Types.ObjectId;
  vocCategoryId: Types.ObjectId;

  // 檔案資訊
  audioFileName: string;      // 例如 "hué-tshia_1754586848.wav"
  contentType?: string;       // "audio/wav" ...
  fileSize?: number;
  duration?: number | null;
  audioType?: "vocabulary" | string;
  isActive?: boolean;

  // 舊資料相容（可能直接存 buffer）
  audioData?: Buffer;
}
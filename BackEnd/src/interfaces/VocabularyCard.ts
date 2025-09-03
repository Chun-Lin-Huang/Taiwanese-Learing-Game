import { Types } from "mongoose";

export interface VocabularyCard {
  _id?: string;
  han: string;               // 漢字
  tl: string;                // 臺羅
  ch: string;                // 中文
  // 這兩個欄位在 DB 裡是 ObjectId
  category_id: Types.ObjectId;           // -> VocabularyCategories._id
  audio_file_id?: Types.ObjectId | null; // -> VocabularyAudio._id
  audio_filename?: string;               // "kuài-tshiú_1754586164.wav"
}
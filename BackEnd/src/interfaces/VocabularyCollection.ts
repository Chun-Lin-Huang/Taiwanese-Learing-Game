// src/interfaces/VocabularyCollection.ts
import { Types } from "mongoose";

export interface VocabularyCollection {
  _id?: Types.ObjectId;
  user_id: Types.ObjectId;   // 使用者 _id（ObjectId，不是 string）
  vocabulary: Array<{
    id: Types.ObjectId;      // VocabularyCards._id
    han?: string;
    tl?: string;
    ch?: string;
    addedAt?: Date;
  }>;
  addTime?: Date;
}
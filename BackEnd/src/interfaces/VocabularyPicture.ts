// src/interfaces/VocabularyPicture.ts
import { Types } from "mongoose";

export interface VocabularyPicture {
  _id?: string;
  imageFileName: string;        // 例如 "公車.png"
  imageSize: number;           // 圖片大小 (bytes)
  imageType: string;           // MIME，例如 "image/png"
  image: Buffer;               // 圖檔二進位（存在 DB，用於串流）
  vocId: Types.ObjectId;       // 關聯 VocabularyCard._id
  createdAt?: Date;
  updatedAt?: Date;
}

// src/Service/VocabularyAudioService.ts
import { Types } from "mongoose";
import { VocabularyAudioModel } from "../orm/schemas/vocabularyAudioSchemas";

export class VocabularyAudioService {
  /** 用 VocabularyAudio._id 取音檔（audioData） */
  async getByDocId(docId: string) {
    if (!Types.ObjectId.isValid(docId)) return null;
    return VocabularyAudioModel.findById(docId)
      .select("_id audioData contentType fileSize isActive")
      .lean();
  }
}
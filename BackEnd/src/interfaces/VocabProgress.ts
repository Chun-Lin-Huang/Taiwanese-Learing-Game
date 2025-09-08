// src/interfaces/VocabProgress.ts
export interface VocabProgress {
  _id?: string;
  userId: string;       // 使用者 ID（字串存即可）
  categoryId: string;   // VocabularyCategories._id
  currentIndex: number; // 0-based
  updatedAt?: Date;
  createdAt?: Date;
}
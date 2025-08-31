// src/interfaces/StoryCollection.ts
export interface StoryCollection {
  _id?: string;
  user_id: string;  // ✅ 用 user_id 而不是 userName
  storyNames: Array<{
    _id: string; // StoryName 的 ObjectId
    name: string;
    imageFilename?: string;
    imageUrl?: string;
    imageSize?: number;
  }>;
  addTime?: Date;
}
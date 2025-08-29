import { StoryName } from "./StoryName";

export interface StoryCollection {
    _id?: string,             // 唯一識別碼
    userName: string,         // 使用者名稱
    storyNames: StoryName[],  // 收藏的故事名稱陣列
    createdAt?: Date,
    updatedAt?: Date
}
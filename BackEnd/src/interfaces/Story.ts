// src/interfaces/Story.ts
export interface Story {
  _id?: string;           // 故事內容 ID
  storyNameId: string;    // 對應 StoryName._id
  chinese: string;        // 中文完整故事
  han: string;            // 漢字完整故事
  imageFilename?: string; // 附加圖檔
}
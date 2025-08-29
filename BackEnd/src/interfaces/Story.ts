export interface Story {
    _id?: string,         // 故事唯一識別碼
    storyNameId: string,  // 對應到 StoryName 的 _id
    chinese: string,      // 中文內容
    han: string,          // 漢字內容
    imageUrl?: string,    // 圖片連結
    audioId?: string      // 音檔ID，對應 StoryAudio 的 _id
}
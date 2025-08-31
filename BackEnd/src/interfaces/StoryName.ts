// src/interfaces/StoryName.ts
export interface StoryName {
  _id?: string;                 // 故事主檔 ID
  name: string;                 // 故事名稱（清單頁顯示）
  imageFilename?: string;       // 圖檔原始檔名
  imageData?: Buffer;           // 圖片二進位
  imageSize?: number;           // 圖片大小（bytes）
  isActive?: boolean;           // 是否啟用
}
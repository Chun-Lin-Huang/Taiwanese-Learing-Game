export interface VocabularyCategories {
  _id?: string;            // 分類 id
  name: string;            // 分類名稱
  image?: Buffer;          // 圖檔二進位（存在 DB，用於串流）
  imageFilename?: string;  // 圖檔原始檔名，例如 "交通工具.png"
  imageSize?: number;      // 圖片大小 (bytes)
  imageType?: string;      // MIME，例如 "image/png"
}
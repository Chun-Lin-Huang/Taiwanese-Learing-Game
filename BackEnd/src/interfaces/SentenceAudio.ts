export interface SentenceAudio {
    _id?: string,         // 檔案唯一識別碼
    filename: string,     // 檔案名稱
    chunkSize?: number,   // 檔案大小
    length?: number,      // 檔案長度
    uploadDate?: Date     // 上傳時間
}
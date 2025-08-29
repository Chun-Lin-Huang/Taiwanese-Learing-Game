export interface VocabularyCards {
    _id?: string,
    category_id: string, // 這裡存的是 VocabuloryCategories 的 _id
    audio_file_id: string, //// 這裡存的是 VocabularyAudio 的 _id
    audio_filename: string, // 這裡存的是 VocabularyAudio 的音檔名稱
    han: string, // 漢字
    tl: string, // 台羅拼音
}
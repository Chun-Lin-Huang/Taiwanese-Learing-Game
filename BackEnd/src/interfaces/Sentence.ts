export interface Sentence {
  _id?: string;
  cardId: string;         // 關聯哪一張單字卡 VocabularyCards 的 _id
  chinese: string;        // 例句（中文）
  han: string;            // 例句（漢字）
  tl: string;             // 例句（台羅）
  audioFileId: string;    // 例句音檔 SentenceAudio 的 _id
  audioFilename?: string;
}
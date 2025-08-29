export interface Game {
  _id?: string;        // 遊戲唯一識別碼
  name: string;        // 遊戲名稱
  categoryId: string;  // 對應 GameCategories._id
  questionCount: number;
}
export interface Question {
  _id?: string;
  userName: string;       // 提問者（建議存小寫）
  questionText: string;   // 問題內容
  createdAt?: Date;
  updatedAt?: Date;
}
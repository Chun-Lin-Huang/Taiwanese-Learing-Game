export interface Users {
  _id?: string;        
  name: string;
  userName: string;     // 唯一帳號（建議持久化時存小寫）
  password: string;
  createdAt?: Date;
  updatedAt?: Date;
}
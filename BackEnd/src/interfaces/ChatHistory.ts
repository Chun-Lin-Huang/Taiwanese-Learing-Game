export interface ChatHistory {
    _id?: string,         // 聊天記錄唯一識別碼
    chatChooseId: string, // 對應到 ChatChoose 的 _id
    userId: string,       // 使用者ID，對應到 Users 的 _id
    role: "user" | "bot", // 角色：使用者或機器人
    message: string,      // 內容
    timestamp: Date,      // 聊天時間戳
}
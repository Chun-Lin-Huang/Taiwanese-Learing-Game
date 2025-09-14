export interface CardUseRequest {
  game_id: string;
  player_id: string;
  card_code: string;
  current_position: string;
  target_player_id?: string; // 用於交換位置等需要目標玩家的卡片
}

export interface CardUseResponse {
  success: boolean;
  new_position?: string;
  action_type: "move" | "teleport" | "skip" | "money" | "item" | "swap";
  card_type?: "reward" | "penalty" | "chance"; // 卡片類型
  value: number | string;
  description: string;
  message: string;
  target_player_id?: string; // 交換位置時返回目標玩家
}

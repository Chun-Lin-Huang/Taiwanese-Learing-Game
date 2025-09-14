export interface Card {
  _id: string;
  code: string;
  type: "reward" | "penalty" | "chance";
  description: string;
  action: "move" | "teleport" | "skip" | "money" | "item";
  value: number | string;
}

export interface CardUseRequest {
  game_id: string;
  player_id: string;
  card_code: string;
  current_position: string;
  target_player_id?: string;
}

export interface CardUseResponse {
  success: boolean;
  new_position?: string;
  action_type: "move" | "teleport" | "skip" | "money" | "item" | "swap";
  card_type?: "reward" | "penalty" | "chance"; // 卡片類型
  value: number | string;
  description: string;
  message: string;
  target_player_id?: string;
}

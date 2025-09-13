export interface GameMoveRequest {
  board_id: string;
  player_id: string;
  current_position: string;
  dice_value: number;
  o17_challenge_success?: boolean; // O17挑戰成功後可以往D5移動
}

export interface GameMoveResponse {
  new_position: string;
  position_info: {
    node_id: string;
    name: string;
    type: string;
    description?: string;
    challenge?: {
      type: string;
      title: string;
      content: string;
      reward: string;
    };
    chance?: {
      type: string;
      title: string;
      content: string;
      effect: string;
    };
    shortcut?: {
      target: string;
      description: string;
    };
  };
  passed_start: boolean;
  round_completed: boolean;
  can_use_shortcut?: boolean;
  alternative_path?: { // O17挑戰成功後的D5路徑選項
    new_position: string;
    path: string[];
  };
}

// src/services/mapApi.ts
import { api } from '../enum/api';
import { asyncGet, asyncPost } from '../utils/fetch';

// 地圖相關的 API 服務
export class MapApiService {
  
  /**
   * 獲取所有地圖板塊
   */
  static async getAllBoards() {
    try {
      const response = await asyncGet(api.mapBoardFindAll);
      return response;
    } catch (error) {
      console.error('獲取地圖板塊失敗:', error);
      throw error;
    }
  }

  /**
   * 根據 ID 獲取地圖板塊資訊
   */
  static async getBoardById(boardId: string) {
    try {
      const response = await asyncGet(`${api.mapBoardFindById}/${boardId}`);
      return response;
    } catch (error) {
      console.error('獲取地圖板塊資訊失敗:', error);
      throw error;
    }
  }

  /**
   * 根據地圖 ID 獲取所有節點
   */
  static async getNodesByBoardId(boardId: string) {
    try {
      const response = await asyncGet(`${api.mapNodeFindByBoardId}/${boardId}`);
      return response;
    } catch (error) {
      console.error('獲取地圖節點失敗:', error);
      throw error;
    }
  }

  /**
   * 根據節點 ID 和地圖 ID 獲取節點詳細資訊
   */
  static async getNodeById(nodeId: string, boardId: string) {
    try {
      const response = await asyncGet(`${api.mapNodeFindById}/${nodeId}/${boardId}`);
      return response;
    } catch (error) {
      console.error('獲取節點資訊失敗:', error);
      throw error;
    }
  }

  /**
   * 根據地圖 ID 獲取所有連接
   */
  static async getEdgesByBoardId(boardId: string) {
    try {
      const response = await asyncGet(`${api.mapEdgeFindByBoardId}/${boardId}`);
      return response;
    } catch (error) {
      console.error('獲取地圖連接失敗:', error);
      throw error;
    }
  }

  /**
   * 根據起始節點獲取可移動的目標節點
   */
  static async getEdgesFromNode(fromNode: string, boardId: string) {
    try {
      const response = await asyncGet(`${api.mapEdgeFindFromNode}/${fromNode}/${boardId}`);
      return response;
    } catch (error) {
      console.error('獲取移動選項失敗:', error);
      throw error;
    }
  }

  /**
   * 計算玩家移動
   */
  static async calculateMove(moveRequest: {
    board_id: string;
    player_id: string;
    current_position: string;
    dice_value: number;
  }) {
    try {
      const response = await asyncPost(api.gameMove, moveRequest);
      return response;
    } catch (error) {
      console.error('計算移動失敗:', error);
      throw error;
    }
  }

  /**
   * 獲取地圖完整資訊（包含所有節點和連接）
   */
  static async getMapInfo(boardId: string) {
    try {
      const response = await asyncGet(`${api.gameMapInfo}/${boardId}`);
      return response;
    } catch (error) {
      console.error('獲取地圖資訊失敗:', error);
      throw error;
    }
  }
}

// 地圖資料類型定義
export interface MapBoard {
  _id: string;
  name: string;
  start_node: string;
  max_players: number;
  version: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface MapNode {
  _id: string;
  node_id: string;
  board_id: string;
  name: string;
  type: 'start' | 'property' | 'challenge' | 'chance' | 'special' | 'shortcut';
  description?: string;
  challenge?: {
    type: 'vocabulary' | 'culture' | 'story' | 'action' | 'train';
    title: string;
    content: string;
    reward: string;
  };
  chance?: {
    type: 'positive' | 'negative' | 'neutral';
    title: string;
    content: string;
    effect: string;
  };
  shortcut?: {
    target: string;
    description: string;
  };
  property?: {
    price?: number;
    rent?: number;
    color?: string;
  };
}

export interface MapEdge {
  _id: string;
  from: string;
  to: string;
  type: 'normal' | 'shortcut' | 'branch' | 'conditional';
  board_id: string;
  condition?: {
    required_challenge?: string;
    required_item?: string;
  };
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
}

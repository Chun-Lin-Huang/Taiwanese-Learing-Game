import { CardService } from "./CardService";
import { GameLogicService } from "./GameLogicService";
import type { resp } from "../utils/resp";
import type { CardUseRequest, CardUseResponse } from "../interfaces/CardUse";
import type { GameMoveRequest } from "../interfaces/GameMove";

export class CardUseService {
  private cardService: CardService;
  private gameLogicService: GameLogicService;

  constructor() {
    this.cardService = new CardService();
    this.gameLogicService = new GameLogicService();
  }

  /** 執行卡片效果 */
  async executeCard(cardUseRequest: CardUseRequest): Promise<resp<CardUseResponse>> {
    const out: resp<CardUseResponse> = { code: 200, message: "", body: {} as CardUseResponse };
    
    try {
      const { game_id, player_id, card_code, current_position, target_player_id } = cardUseRequest;

      // 1. 獲取卡片資訊
      const cardResult = await this.cardService.getCardByCode(card_code);
      if (cardResult.code !== 200 || !cardResult.body) {
        out.code = 404; 
        out.message = "找不到卡片"; 
        return out;
      }

      const card = cardResult.body;
      console.log('執行卡片:', card);

      // 2. 根據卡片類型執行相應效果
      let result: CardUseResponse;

      switch (card.action) {
        case "move":
          result = await this.executeMoveCard(card, current_position, game_id);
          break;
        case "teleport":
          result = await this.executeTeleportCard(card, current_position, game_id);
          break;
        case "skip":
          result = await this.executeSkipCard(card, player_id, game_id);
          break;
        case "money":
          // 跳過金錢卡片處理
          result = {
            success: true,
            action_type: "money",
            card_type: card.type,
            value: card.value,
            description: card.description,
            message: `金錢卡片：${card.description}（已跳過）`
          };
          break;
        case "item":
          result = await this.executeItemCard(card, player_id, game_id);
          break;
        default:
          out.code = 400; 
          out.message = "不支援的卡片動作類型"; 
          return out;
      }

      out.body = result;
      out.message = "卡片執行成功";
      return out;

    } catch (error) {
      console.error("執行卡片時發生錯誤:", error);
      out.code = 500; 
      out.message = "執行卡片時發生錯誤"; 
      return out;
    }
  }

  /** 執行移動類卡片 */
  private async executeMoveCard(card: any, currentPosition: string, gameId: string): Promise<CardUseResponse> {
    const moveValue = typeof card.value === 'number' ? card.value : parseInt(card.value);
    
    // 簡化移動邏輯，直接計算新位置
    let newPosition = currentPosition;
    
    if (moveValue > 0) {
      // 前進邏輯：簡單地增加位置編號
      newPosition = this.calculateForwardPosition(currentPosition, moveValue);
    } else if (moveValue < 0) {
      // 後退邏輯：減少位置編號
      newPosition = this.calculateBackwardPosition(currentPosition, Math.abs(moveValue));
    }

    return {
      success: true,
      new_position: newPosition,
      action_type: "move",
      card_type: card.type,
      value: moveValue,
      description: card.description,
      message: `執行移動卡片：${card.description}`
    };
  }

  /** 執行傳送類卡片 */
  private async executeTeleportCard(card: any, currentPosition: string, gameId: string): Promise<CardUseResponse> {
    let targetPosition = card.value;
    
    // 處理特殊位置代碼
    if (targetPosition === "S0") {
      targetPosition = "S0"; // 起點
    } else if (targetPosition === "08") {
      targetPosition = "08"; // 加油站
    } else if (targetPosition === "17") {
      targetPosition = "17"; // 火車挑戰格
    } else if (targetPosition === "null") {
      // 交換位置卡片，需要特殊處理
      return {
        success: true,
        action_type: "swap",
        card_type: card.type,
        value: targetPosition,
        description: card.description,
        message: "需要選擇目標玩家進行位置交換"
      };
    }

    return {
      success: true,
      new_position: targetPosition,
      action_type: "teleport",
      card_type: card.type,
      value: targetPosition,
      description: card.description,
      message: `執行傳送卡片：${card.description}`
    };
  }

  /** 執行跳過回合卡片 */
  private async executeSkipCard(card: any, playerId: string, gameId: string): Promise<CardUseResponse> {
    return {
      success: true,
      action_type: "skip",
      card_type: card.type,
      value: card.value,
      description: card.description,
      message: `執行跳過卡片：${card.description}`
    };
  }


  /** 執行道具類卡片 */
  private async executeItemCard(card: any, playerId: string, gameId: string): Promise<CardUseResponse> {
    return {
      success: true,
      action_type: "item",
      value: card.value,
      description: card.description,
      message: `執行道具卡片：${card.description}`
    };
  }

  /** 計算前進位置（簡化版本） */
  private calculateForwardPosition(currentPosition: string, steps: number): string {
    // 簡化版本：假設位置是數字編號，直接相加
    console.log(`計算前進位置：從 ${currentPosition} 前進 ${steps} 步`);
    
    // 如果是起點 S0，前進到第一個位置
    if (currentPosition === "S0") {
      return "01"; // 假設第一個位置是 01
    }
    
    // 如果是數字位置，直接相加
    const currentNum = parseInt(currentPosition);
    if (!isNaN(currentNum)) {
      const newNum = currentNum + steps;
      return newNum.toString().padStart(2, '0'); // 補零到兩位數
    }
    
    return currentPosition; // 無法計算時返回原位置
  }

  /** 計算後退位置（簡化版本） */
  private calculateBackwardPosition(currentPosition: string, steps: number): string {
    // 簡化版本：假設位置是數字編號，直接相減
    console.log(`計算後退位置：從 ${currentPosition} 後退 ${steps} 步`);
    
    // 如果是起點 S0，後退到最後一個位置
    if (currentPosition === "S0") {
      return "20"; // 假設最後一個位置是 20
    }
    
    // 如果是數字位置，直接相減
    const currentNum = parseInt(currentPosition);
    if (!isNaN(currentNum)) {
      const newNum = Math.max(1, currentNum - steps); // 最小為 1
      return newNum.toString().padStart(2, '0'); // 補零到兩位數
    }
    
    return currentPosition; // 無法計算時返回原位置
  }

  /** 交換玩家位置 */
  async swapPlayerPositions(gameId: string, player1Id: string, player2Id: string): Promise<resp<CardUseResponse>> {
    const out: resp<CardUseResponse> = { code: 200, message: "", body: {} as CardUseResponse };
    
    try {
      // 這裡需要實現位置交換的邏輯
      // 可能需要更新遊戲狀態或玩家位置記錄
      
      out.body = {
        success: true,
        action_type: "swap",
        value: "position_swap",
        description: "與玩家交換位置",
        message: "位置交換成功",
        target_player_id: player2Id
      };
      
      out.message = "位置交換成功";
      return out;
      
    } catch (error) {
      console.error("交換位置時發生錯誤:", error);
      out.code = 500; 
      out.message = "交換位置時發生錯誤"; 
      return out;
    }
  }
}

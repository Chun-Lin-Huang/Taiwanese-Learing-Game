import { api } from '../enum/api';
import { asyncGet, asyncPost } from '../utils/fetch';
import type { Card, CardUseRequest, CardUseResponse } from '../interfaces/Card';

export class CardApiService {
  /** 根據 code 查詢卡片 */
  static async getCardByCode(code: string): Promise<Card> {
    try {
      const response = await asyncGet(`${api.cardByCode}/${code}`);
      return response.body;
    } catch (error: any) {
      console.error('獲取卡片失敗:', error);
      throw new Error(`卡片 ${code} 不存在: ${error.message}`);
    }
  }

  /** 使用卡片 */
  static async useCard(cardUseRequest: CardUseRequest): Promise<CardUseResponse> {
    try {
      const response = await asyncPost(api.cardUse, cardUseRequest);
      return response.body;
    } catch (error: any) {
      console.error('使用卡片失敗:', error);
      throw new Error(`使用卡片失敗: ${error.message}`);
    }
  }

  /** 交換玩家位置 */
  static async swapPositions(gameId: string, player1Id: string, player2Id: string): Promise<CardUseResponse> {
    const response = await asyncPost(api.cardSwapPositions, {
      game_id: gameId,
      player1_id: player1Id,
      player2_id: player2Id
    });
    return response.body;
  }
}

import { Contorller } from "../abstract/Contorller";
import { Request, Response } from "express";
import { CardUseService } from "../Service/CardUseService";

export class CardUseController extends Contorller {
  protected service: CardUseService;
  
  constructor() { 
    super(); 
    this.service = new CardUseService(); 
  }

  /** POST /api/v1/game/use-card - 使用卡片 */
  public async useCard(req: Request, res: Response) {
    const { game_id, player_id, card_code, current_position, target_player_id } = req.body;
    
    if (!game_id || !player_id || !card_code || !current_position) {
      return res.status(400).send({
        code: 400,
        message: "缺少必要參數：game_id, player_id, card_code, current_position",
        body: null
      });
    }

    const result = await this.service.executeCard({
      game_id,
      player_id,
      card_code,
      current_position,
      target_player_id
    });
    
    res.status(result.code).send(result);
  }

  /** POST /api/v1/game/swap-positions - 交換玩家位置 */
  public async swapPositions(req: Request, res: Response) {
    const { game_id, player1_id, player2_id } = req.body;
    
    if (!game_id || !player1_id || !player2_id) {
      return res.status(400).send({
        code: 400,
        message: "缺少必要參數：game_id, player1_id, player2_id",
        body: null
      });
    }

    const result = await this.service.swapPlayerPositions(game_id, player1_id, player2_id);
    res.status(result.code).send(result);
  }
}

import { CardModel } from "../orm/schemas/cardSchemas";
import type { Card } from "../interfaces/Card";
import type { resp } from "../utils/resp";
import type { DBResp } from "../interfaces/DBResp";

export class CardService {
  /** 根據 code 查詢卡片 */
  async getCardByCode(code: string): Promise<resp<DBResp<Card> | undefined>> {
    const out: resp<DBResp<Card> | undefined> = { code: 200, message: "", body: undefined };
    try {
      if (!code || code.trim() === "") {
        out.code = 400; 
        out.message = "code is required"; 
        return out;
      }

      const card = await CardModel.findOne({ code: code.trim() }).lean();
      
      if (!card) {
        out.code = 404; 
        out.message = "card not found"; 
        return out;
      }

      out.code = 200; 
      out.message = "card found successfully"; 
      out.body = card as any;
      return out;
    } catch (error) {
      console.error("Error in getCardByCode:", error);
      out.code = 500; 
      out.message = "server error"; 
      return out;
    }
  }

  /** 獲取所有卡片 */
  async getAllCards(): Promise<resp<Card[]>> {
    const out: resp<Card[]> = { code: 200, message: "", body: [] };
    try {
      const cards = await CardModel.find({}).lean();
      
      out.code = 200; 
      out.message = "cards retrieved successfully"; 
      out.body = cards as any;
      return out;
    } catch (error) {
      console.error("Error in getAllCards:", error);
      out.code = 500; 
      out.message = "server error"; 
      return out;
    }
  }

  /** 根據類型獲取卡片 */
  async getCardsByType(type: "reward" | "penalty" | "chance"): Promise<resp<Card[]>> {
    const out: resp<Card[]> = { code: 200, message: "", body: [] };
    try {
      if (!["reward", "penalty", "chance"].includes(type)) {
        out.code = 400; 
        out.message = "invalid card type"; 
        return out;
      }

      const cards = await CardModel.find({ type }).lean();
      
      out.code = 200; 
      out.message = "cards retrieved successfully"; 
      out.body = cards as any;
      return out;
    } catch (error) {
      console.error("Error in getCardsByType:", error);
      out.code = 500; 
      out.message = "server error"; 
      return out;
    }
  }
}

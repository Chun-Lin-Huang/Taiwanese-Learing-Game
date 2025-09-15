// src/Service/GameLogicService.ts
import { MapEdgeService } from "./MapEdgeService";
import { MapNodeService } from "./MapNodeService";
import { MapBoardService } from "./MapBoardService";
import type { resp } from "../utils/resp";
import type { GameMoveRequest, GameMoveResponse } from "../interfaces/GameMove";

export class GameLogicService {
  private mapEdgeService: MapEdgeService;
  private mapNodeService: MapNodeService;
  private mapBoardService: MapBoardService;

  constructor() {
    this.mapEdgeService = new MapEdgeService();
    this.mapNodeService = new MapNodeService();
    this.mapBoardService = new MapBoardService();
  }

  /** 計算玩家移動 */
  async calculateMove(moveRequest: GameMoveRequest): Promise<resp<GameMoveResponse>> {
    const out: resp<GameMoveResponse> = { code: 200, message: "", body: {} as GameMoveResponse };
    try {
      const { board_id, player_id, current_position, dice_value, o17_challenge_success } = moveRequest;

      if (!board_id || !player_id || !current_position || !dice_value) {
        out.code = 400; out.message = "缺少必要參數"; return out;
      }

      // 1. 獲取整個地圖的所有連接
      const edgesResult = await this.mapEdgeService.getEdgesByBoardId(board_id);
      if (edgesResult.code !== 200 || !edgesResult.body) {
        out.code = 404; out.message = "找不到地圖連接"; return out;
      }
      const edges = edgesResult.body;

      // 2. 根據骰子值計算新位置和路徑
      console.log('開始計算移動，參數:', { current_position, dice_value, edges_count: edges.length, o17_challenge_success });
      
      let moveResult;
      // 檢查是否有O17挑戰成功記錄，如果有則計算兩條路徑：正常路徑和鐵路路徑
      if (o17_challenge_success) {
        console.log('O17挑戰成功，計算正常路徑和鐵路路徑選項');
        const normalPath = this.calculateMoveWithPath(edges, dice_value, current_position);
        const railwayPath = this.calculateRailwayPath(edges, dice_value, current_position);
        
        // 返回兩條路徑選項
        moveResult = {
          newPosition: normalPath?.newPosition || current_position,
          path: normalPath?.path || [current_position],
          alternativePath: railwayPath ? {
            new_position: railwayPath.newPosition, // 轉換屬性名
            path: railwayPath.path
          } : null // 鐵路路徑選項
        };
      } else {
        moveResult = this.calculateMoveWithPath(edges, dice_value, current_position);
      }
      console.log('移動計算結果:', moveResult);

      if (!moveResult || !moveResult.newPosition) {
        console.error('移動計算失敗:', {
          current_position,
          dice_value,
          edges_count: edges.length,
          available_edges: edges.map((e: any) => `${e.from}->${e.to}(${e.type})`)
        });
        out.code = 400; out.message = "無法計算新位置"; return out;
      }

      const { newPosition, path } = moveResult;
      console.log('計算出的新位置:', newPosition, '移動路徑:', path);

      // 3. 獲取新位置的詳細資訊
      const nodeResult = await this.mapNodeService.getNodeById(newPosition, board_id);
      if (nodeResult.code !== 200 || !nodeResult.body) {
        out.code = 404; out.message = "新位置節點不存在"; return out;
      }

      // 4. 檢查是否通過起點
      const boardResult = await this.mapBoardService.getBoardById(board_id);
      const startNode = boardResult.body?.start_node;
      const passedStart = this.checkPassedStartInPath(path, startNode);

      // 5. 檢查是否可以使用捷徑
      const canUseShortcut = this.checkCanUseShortcut(edges, newPosition);

      out.code = 200;
      out.message = "移動計算成功";
      out.body = {
        new_position: newPosition,
        position_info: {
          node_id: nodeResult.body.node_id,
          name: nodeResult.body.name,
          type: nodeResult.body.type,
          description: nodeResult.body.description,
          challenge: nodeResult.body.challenge,
          chance: nodeResult.body.chance,
          shortcut: nodeResult.body.shortcut
        },
        passed_start: passedStart,
        round_completed: passedStart,
        can_use_shortcut: canUseShortcut,
        alternative_path: (moveResult as any).alternativePath // 包含鐵路路徑選項
      };
      return out;
    } catch {
      out.code = 500; out.message = "server error"; return out;
    }
  }

  /** 計算鐵路路徑（O17挑戰成功後的特殊路徑） */
  private calculateRailwayPath(edges: any[], diceValue: number, currentPosition: string): { newPosition: string; path: string[] } | null {
    try {
      console.log('計算鐵路特殊路徑:', { currentPosition, diceValue });
      
      // 從當前位置開始，按照骰子值移動，但目標是火車站前街
      let currentPos = currentPosition;
      const path: string[] = [currentPosition];
      
      // 第一步：移動到D5（幸福大道）
      const railwayEdge = edges.find(edge => edge.from === currentPosition && edge.to === 'D5');
      if (!railwayEdge) {
        console.log('找不到從當前位置到D5的連接');
        return null;
      }
      
      currentPos = 'D5';
      path.push(currentPos);
      console.log(`第1步：移動到D5`);
      
      // 剩餘步數：從D5繼續移動
      const remainingSteps = diceValue - 1;
      console.log(`剩餘步數：${remainingSteps}`);
      
      for (let step = 0; step < remainingSteps; step++) {
        console.log(`第${step + 2}步，當前位置: ${currentPos}`);
        
        // 尋找從當前位置出發的連接
        const availableEdges = edges.filter(edge => edge.from === currentPos);
        console.log(`從 ${currentPos} 出發的連接:`, availableEdges.map(e => `${e.from}->${e.to}`));
        
        if (availableEdges.length === 0) {
          console.log('沒有可用的連接，停止移動');
          break;
        }
        
        // 選擇第一個可用路徑
        const nextEdge = availableEdges[0];
        currentPos = nextEdge.to;
        path.push(currentPos);
        
        console.log(`移動到: ${currentPos}`);
      }
      
      console.log('鐵路路徑計算完成，最終位置:', currentPos, '路徑:', path);
      return { newPosition: currentPos, path };
    } catch (error) {
      console.error('鐵路路徑計算錯誤:', error);
      return null;
    }
  }

  /** 根據連接和骰子值計算新位置和路徑 */
  private calculateMoveWithPath(edges: any[], diceValue: number, currentPosition: string): { newPosition: string; path: string[] } | null {
    try {
      console.log('開始計算移動:', { currentPosition, diceValue, edgesCount: edges.length });
      
      let currentPos = currentPosition;
      const path: string[] = [currentPosition]; // 記錄移動路徑
      
      // 根據骰子值移動相應步數
      for (let step = 0; step < diceValue; step++) {
        console.log(`第${step + 1}步，當前位置: ${currentPos}`);
        
        // 找到從當前位置出發的所有連接
        const outgoingEdges = edges.filter(edge => edge.from === currentPos);
        console.log(`從 ${currentPos} 出發的連接:`, outgoingEdges.map(e => `${e.from}->${e.to}(${e.type})`));
        
        if (outgoingEdges.length === 0) {
          console.error('找不到從位置出發的連接:', currentPos);
          return null;
        }

        // 優先使用 normal 類型的連接
        const normalEdges = outgoingEdges.filter(edge => edge.type === 'normal');
        
        if (normalEdges.length > 0) {
          // 如果有 normal 連接，移動到目標位置
          currentPos = normalEdges[0].to;
          console.log(`使用 normal 連接: ${normalEdges[0].from} → ${currentPos}`);
        } else {
          // 如果沒有 normal 連接，處理 conditional 類型的連接
          const conditionalEdges = outgoingEdges.filter(edge => edge.type === 'conditional');
          if (conditionalEdges.length > 0) {
            // 對於 conditional 類型，優先選擇通往正常路徑的連接（不是 D 開頭的）
            const normalPathEdge = conditionalEdges.find(edge => !edge.to.startsWith('D'));
            if (normalPathEdge) {
              currentPos = normalPathEdge.to;
              console.log(`使用 conditional 正常路徑連接: ${normalPathEdge.from} → ${currentPos}`);
            } else {
              // 如果沒有正常路徑，使用第一個 conditional 連接
              currentPos = conditionalEdges[0].to;
              console.log(`使用 conditional 連接: ${conditionalEdges[0].from} → ${currentPos}`);
            }
          } else {
            // 如果沒有 conditional 連接，使用其他類型的連接
            currentPos = outgoingEdges[0].to;
            console.log(`使用其他連接: ${outgoingEdges[0].from} → ${currentPos}`);
          }
        }
        
        path.push(currentPos); // 記錄路徑
      }
      
      console.log('移動完成，最終位置:', currentPos, '路徑:', path);
      return { newPosition: currentPos, path };
    } catch (error) {
      console.error('移動計算錯誤:', error);
      return null;
    }
  }

  /** 根據連接和骰子值計算新位置（舊版本，保留向後兼容） */
  private calculateNewPosition(edges: any[], diceValue: number, currentPosition: string): string | null {
    try {
      console.log('開始計算移動:', { currentPosition, diceValue, edgesCount: edges.length });
      
      let currentPos = currentPosition;
      
      // 根據骰子值移動相應步數
      for (let step = 0; step < diceValue; step++) {
        console.log(`第${step + 1}步，當前位置: ${currentPos}`);
        
        // 找到從當前位置出發的所有連接
        const outgoingEdges = edges.filter(edge => edge.from === currentPos);
        console.log(`從 ${currentPos} 出發的連接:`, outgoingEdges.map(e => `${e.from}->${e.to}(${e.type})`));
        
        if (outgoingEdges.length === 0) {
          console.error('找不到從位置出發的連接:', currentPos);
          return null;
        }

        // 優先使用 normal 類型的連接
        const normalEdges = outgoingEdges.filter(edge => edge.type === 'normal');
        
        if (normalEdges.length > 0) {
          // 如果有 normal 連接，移動到目標位置
          currentPos = normalEdges[0].to;
          console.log(`使用 normal 連接: ${outgoingEdges[0].from} → ${currentPos}`);
        } else {
          // 如果沒有 normal 連接，使用其他類型的連接
          currentPos = outgoingEdges[0].to;
          console.log(`使用其他連接: ${outgoingEdges[0].from} → ${currentPos}`);
        }
      }
      
      console.log('移動完成，最終位置:', currentPos);
      return currentPos;
    } catch (error) {
      console.error('移動計算錯誤:', error);
      return null;
    }
  }

  /** 檢查路徑中是否經過起點 */
  private checkPassedStartInPath(path: string[], startNode?: string): boolean {
    if (!startNode) return false;
    
    // 檢查路徑中是否包含起點（排除起始位置）
    for (let i = 1; i < path.length; i++) {
      if (path[i] === startNode) {
        console.log('路徑中經過起點:', path, '起點:', startNode);
        return true;
      }
    }
    
    return false;
  }

  /** 檢查是否通過起點（舊版本，保留向後兼容） */
  private checkPassedStart(currentPosition: string, newPosition: string, startNode?: string): boolean {
    if (!startNode) return false;
    
    // 如果移動到起點，算作通過起點
    if (newPosition === startNode) {
      return true;
    }
    
    return false;
  }

  /** 檢查是否可以使用捷徑 */
  private checkCanUseShortcut(edges: any[], newPosition: string): boolean {
    // 檢查是否有捷徑類型的連接
    const shortcutEdges = edges.filter(edge => 
      edge.type === 'shortcut' && edge.to === newPosition
    );
    return shortcutEdges.length > 0;
  }

  /** 獲取地圖的完整資訊（包含所有節點和連接） */
  async getMapInfo(boardId: string): Promise<resp<any>> {
    const out: resp<any> = { code: 200, message: "", body: undefined };
    try {
      if (!boardId) {
        out.code = 400; out.message = "缺少 boardId"; return out;
      }

      // 獲取地圖基本資訊
      const boardResult = await this.mapBoardService.getBoardById(boardId);
      if (boardResult.code !== 200) {
        out.code = boardResult.code; out.message = boardResult.message; return out;
      }

      // 獲取所有節點
      const nodes = await this.mapNodeService.getNodesByBoardId(boardId);
      if (!nodes) {
        out.code = 500; out.message = "獲取節點失敗"; return out;
      }

      // 獲取所有連接
      const edges = await this.mapEdgeService.getEdgesByBoardId(boardId);
      if (!edges) {
        out.code = 500; out.message = "獲取連接失敗"; return out;
      }

      out.code = 200;
      out.message = "獲取地圖資訊成功";
      out.body = {
        board: boardResult.body,
        nodes: nodes,
        edges: edges
      };
      return out;
    } catch {
      out.code = 500; out.message = "server error"; return out;
    }
  }
}

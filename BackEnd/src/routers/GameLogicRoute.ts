import { Route } from "../abstract/Route"
import { GameLogicController } from "../controller/GameLogicController";
import { logger } from "../middlewares/log";

export class GameLogicRoute extends Route {

    protected url: string;
    protected Contorller = new GameLogicController();

    constructor() {
        super()
        this.url = '/api/v1/game/'
        this.setRoutes()
    }

    protected setRoutes(): void {

        /**
         * 計算玩家移動
         * request body {
         *  board_id: string,
         *  player_id: string,
         *  current_position: string,
         *  dice_value: number
         * }
         * @returns resp<GameMoveResponse>
         */
        this.router.post(`${this.url}move`, (req, res) => {
            this.Contorller.move(req, res);
        })

        /**
         * 獲取地圖完整資訊（包含所有節點和連接）
         * @param boardId - 地圖板塊 ID
         * @returns resp<{board: MapBoard, nodes: MapNode[], edges: MapEdge[]}>
         */
        this.router.get(`${this.url}mapInfo/:boardId`, (req, res) => {
            this.Contorller.getMapInfo(req, res);
        });
    }
}

import { Route } from "../abstract/Route"
import { MapEdgeController } from "../controller/MapEdgeController";
import { logger } from "../middlewares/log";

export class MapEdgeRoute extends Route {

    protected url: string;
    protected Contorller = new MapEdgeController();

    constructor() {
        super()
        this.url = '/api/v1/map-edge/'
        this.setRoutes()
    }

    protected setRoutes(): void {

        /**
         * 根據地圖 ID 取得所有連接
         * @param boardId - 地圖板塊 ID
         * @returns resp<MapEdge[]>
         */
        this.router.get(`${this.url}findByBoardId/:boardId`, (req, res) => {
            this.Contorller.findByBoardId(req, res);
        })

        /**
         * 根據起始節點取得可移動的目標節點
         * @param fromNode - 起始節點 ID
         * @param boardId - 地圖板塊 ID
         * @returns resp<MapEdge[]>
         */
        this.router.get(`${this.url}findFromNode/:fromNode/:boardId`, (req, res) => {
            this.Contorller.findFromNode(req, res);
        })

        /**
         * 新增連接
         * request body {
         *  from: string,
         *  to: string,
         *  board_id: string,
         *  type: string,
         *  condition?: object
         * } 
         * @returns resp<MapEdge>
         */
        this.router.post(`${this.url}insertOne`, (req, res) => {
            this.Contorller.insertOne(req, res);
        })

        /**
         * 批量新增連接
         * request body {
         *  edges: MapEdge[]
         * }
         * @returns resp<{count: number, edges: MapEdge[]}>
         */
        this.router.post(`${this.url}insertMany`, (req, res) => {
            this.Contorller.insertMany(req, res);
        })

        /**
         * 更新連接資訊
         * request body {
         *  _id: string,
         *  ...其他欄位
         * }
         * @returns resp<MapEdge>
         */
        this.router.put(`${this.url}updateById`, (req, res) => {
            this.Contorller.updateById(req, res);
        });

        /**
         * 刪除連接
         * @param id - 連接 ID
         * @returns resp<{_id: string}>
         */
        this.router.delete(`${this.url}deleteById/:id`, (req, res) => {
            this.Contorller.deleteById(req, res);
        });
    }
}

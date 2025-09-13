import { Route } from "../abstract/Route"
import { MapNodeController } from "../controller/MapNodeController";
import { logger } from "../middlewares/log";

export class MapNodeRoute extends Route {

    protected url: string;
    protected Contorller = new MapNodeController();

    constructor() {
        super()
        this.url = '/api/v1/map-node/'
        this.setRoutes()
    }

    protected setRoutes(): void {

        /**
         * 根據地圖 ID 取得所有節點
         * @param boardId - 地圖板塊 ID
         * @returns resp<MapNode[]>
         */
        this.router.get(`${this.url}findByBoardId/:boardId`, (req, res) => {
            this.Contorller.findByBoardId(req, res);
        })

        /**
         * 根據節點 ID 和地圖 ID 取得節點資訊
         * @param nodeId - 節點 ID
         * @param boardId - 地圖板塊 ID
         * @returns resp<MapNode>
         */
        this.router.get(`${this.url}findById/:nodeId/:boardId`, (req, res) => {
            this.Contorller.findById(req, res);
        })

        /**
         * 新增節點
         * request body {
         *  node_id: string,
         *  board_id: string,
         *  name: string,
         *  type: string,
         *  description?: string,
         *  challenge?: object,
         *  chance?: object,
         *  shortcut?: object,
         *  property?: object
         * } 
         * @returns resp<MapNode>
         */
        this.router.post(`${this.url}insertOne`, (req, res) => {
            this.Contorller.insertOne(req, res);
        })

        /**
         * 批量新增節點
         * request body {
         *  nodes: MapNode[]
         * }
         * @returns resp<{count: number, nodes: MapNode[]}>
         */
        this.router.post(`${this.url}insertMany`, (req, res) => {
            this.Contorller.insertMany(req, res);
        })

        /**
         * 更新節點資訊
         * request body {
         *  _id: string,
         *  ...其他欄位
         * }
         * @returns resp<MapNode>
         */
        this.router.put(`${this.url}updateById`, (req, res) => {
            this.Contorller.updateById(req, res);
        });

        /**
         * 刪除節點
         * @param id - 節點 ID
         * @returns resp<{_id: string}>
         */
        this.router.delete(`${this.url}deleteById/:id`, (req, res) => {
            this.Contorller.deleteById(req, res);
        });
    }
}

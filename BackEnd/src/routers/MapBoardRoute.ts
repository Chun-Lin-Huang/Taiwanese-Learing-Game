import { Route } from "../abstract/Route"
import { MapBoardController } from "../controller/MapBoardController";
import { logger } from "../middlewares/log";

export class MapBoardRoute extends Route {

    protected url: string;
    protected Contorller = new MapBoardController();

    constructor() {
        super()
        this.url = '/api/v1/map-board/'
        this.setRoutes()
    }

    protected setRoutes(): void {

        /**
         * 取得所有地圖板塊
         * @returns resp<MapBoard[]>
         */
        this.router.get(`${this.url}findAll`, (req, res) => {
            this.Contorller.findAll(req, res);
        })

        /**
         * 根據 ID 取得地圖板塊資訊
         * @param id - 地圖板塊 ID
         * @returns resp<MapBoard>
         */
        this.router.get(`${this.url}findById/:id`, (req, res) => {
            this.Contorller.findById(req, res);
        })

        /**
         * 新增地圖板塊
         * request body {
         *  name: string,
         *  start_node: string,
         *  max_players: number,
         *  version: number,
         *  image?: object
         * } 
         * @returns resp<MapBoard>
         */
        this.router.post(`${this.url}insertOne`, (req, res) => {
            this.Contorller.insertOne(req, res);
        })

        /**
         * 更新地圖板塊資訊
         * request body {
         *  _id: string,
         *  name?: string,
         *  start_node?: string,
         *  max_players?: number,
         *  version?: number,
         *  image?: object
         * }
         * @returns resp<MapBoard>
         */
        this.router.put(`${this.url}updateById`, (req, res) => {
            this.Contorller.updateById(req, res);
        });

        /**
         * 刪除地圖板塊
         * @param id - 地圖板塊 ID
         * @returns resp<{_id: string}>
         */
        this.router.delete(`${this.url}deleteById/:id`, (req, res) => {
            this.Contorller.deleteById(req, res);
        });
    }
}

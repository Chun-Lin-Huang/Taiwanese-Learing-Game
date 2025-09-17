import { Route } from "../abstract/Route";
import { RoomController } from "../controller/RoomController";

export class RoomRoute extends Route {
  protected url: string;
  protected Contorller = new RoomController();

  constructor() {
    super();
    this.url = '/api/v1/rooms/';
    this.setRoutes();
  }

  protected setRoutes(): void {
    /**
     * 創建房間
     * POST /api/v1/rooms/create
     * Body: { gameName: string, maxPlayers: number, boardId?: string }
     */
    this.router.post(`${this.url}create`, (req, res) => {
      this.Contorller.createRoom(req, res);
    });

    /**
     * 根據房間代碼查找房間
     * GET /api/v1/rooms/:roomCode
     */
    this.router.get(`${this.url}:roomCode`, (req, res) => {
      this.Contorller.getRoomByCode(req, res);
    });

    /**
     * 加入房間
     * POST /api/v1/rooms/:roomCode/join
     * Body: { playerId: number, playerName: string, userName?: string }
     */
    this.router.post(`${this.url}:roomCode/join`, (req, res) => {
      this.Contorller.joinRoom(req, res);
    });

    /**
     * 離開房間
     * POST /api/v1/rooms/:roomCode/leave
     * Body: { playerId: number }
     */
    this.router.post(`${this.url}:roomCode/leave`, (req, res) => {
      this.Contorller.leaveRoom(req, res);
    });

    /**
     * 更新玩家準備狀態
     * PUT /api/v1/rooms/:roomCode/ready
     * Body: { playerId: number, isReady: boolean }
     */
    this.router.put(`${this.url}:roomCode/ready`, (req, res) => {
      this.Contorller.updatePlayerReady(req, res);
    });

    /**
     * 更新房間狀態
     * PUT /api/v1/rooms/:roomCode/status
     * Body: { status: 'waiting' | 'in_progress' | 'completed' | 'abandoned' }
     */
    this.router.put(`${this.url}:roomCode/status`, (req, res) => {
      this.Contorller.updateRoomStatus(req, res);
    });
  }
}

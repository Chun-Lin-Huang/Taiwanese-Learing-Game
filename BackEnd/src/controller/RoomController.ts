import { Contorller } from "../abstract/Contorller";
import { Request, Response } from "express";
import { RoomService } from "../Service/RoomService";
import type { resp } from "../utils/resp";

export class RoomController extends Contorller {
  protected service: RoomService;

  constructor() {
    super();
    this.service = new RoomService();
  }

  /** POST /api/v1/rooms/create */
  public async createRoom(req: Request, res: Response) {
    const out: resp<any> = { code: 200, message: "", body: undefined };
    try {
      const { name, maxPlayers, gameType, hostId, boardId } = req.body;
      // 使用 name 作為 gameName，如果沒有提供 boardId 則使用默認值
      const gameName = name || gameType || '大富翁遊戲';
      const result = await this.service.createRoom(gameName, maxPlayers, boardId);
      return res.status(result.code).send(result);
    } catch (err: any) {
      out.code = 500; out.message = err.message || "server error";
      return res.status(500).send(out);
    }
  }

  /** GET /api/v1/rooms/:roomCode */
  public async getRoomByCode(req: Request, res: Response) {
    const out: resp<any> = { code: 200, message: "", body: undefined };
    try {
      const { roomCode } = req.params;
      const result = await this.service.getRoomByCode(roomCode);
      return res.status(result.code).send(result);
    } catch (err: any) {
      out.code = 500; out.message = err.message || "server error";
      return res.status(500).send(out);
    }
  }

  /** POST /api/v1/rooms/:roomCode/join */
  public async joinRoom(req: Request, res: Response) {
    const out: resp<any> = { code: 200, message: "", body: undefined };
    try {
      const { roomCode } = req.params;
      const { playerId, playerName, userName } = req.body;
      const result = await this.service.joinRoom(roomCode, playerId, playerName, userName);
      return res.status(result.code).send(result);
    } catch (err: any) {
      out.code = 500; out.message = err.message || "server error";
      return res.status(500).send(out);
    }
  }

  /** POST /api/v1/rooms/:roomCode/leave */
  public async leaveRoom(req: Request, res: Response) {
    const out: resp<any> = { code: 200, message: "", body: undefined };
    try {
      const { roomCode } = req.params;
      const { playerId } = req.body;
      const result = await this.service.leaveRoom(roomCode, playerId);
      return res.status(result.code).send(result);
    } catch (err: any) {
      out.code = 500; out.message = err.message || "server error";
      return res.status(500).send(out);
    }
  }

  /** PUT /api/v1/rooms/:roomCode/ready */
  public async updatePlayerReady(req: Request, res: Response) {
    const out: resp<any> = { code: 200, message: "", body: undefined };
    try {
      const { roomCode } = req.params;
      const { playerId, isReady } = req.body;
      const result = await this.service.updatePlayerReady(roomCode, playerId, isReady);
      return res.status(result.code).send(result);
    } catch (err: any) {
      out.code = 500; out.message = err.message || "server error";
      return res.status(500).send(out);
    }
  }

  /** PUT /api/v1/rooms/:roomCode/status */
  public async updateRoomStatus(req: Request, res: Response) {
    const out: resp<any> = { code: 200, message: "", body: undefined };
    try {
      const { roomCode } = req.params;
      const { status } = req.body;
      const result = await this.service.updateRoomStatus(roomCode, status);
      return res.status(result.code).send(result);
    } catch (err: any) {
      out.code = 500; out.message = err.message || "server error";
      return res.status(500).send(out);
    }
  }
}

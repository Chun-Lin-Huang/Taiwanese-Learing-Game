import { Router } from "express";
import { Route } from "../abstract/Route";
import { MonopolyHistoryController } from "../controller/MonopolyHistoryController";

export class MonopolyHistoryRoute extends Route {
  protected url: string = "/api/v1/monopoly-history";
  public Contorller: MonopolyHistoryController;

  constructor() {
    super();
    this.Contorller = new MonopolyHistoryController();
    this.setRoutes();
  }

  protected setRoutes(): void {
    // 創建新的遊戲記錄
    this.router.post(`${this.url}/create`, (req, res) => {
      this.Contorller.createGame(req, res);
    });

    // 添加遊戲動作到現有遊戲
    this.router.post(`${this.url}/:gameId/action`, (req, res) => {
      this.Contorller.addGameAction(req, res);
    });

    // 結束遊戲
    this.router.post(`${this.url}/:gameId/end`, (req, res) => {
      this.Contorller.endGame(req, res);
    });

    // 根據遊戲ID獲取遊戲記錄
    this.router.get(`${this.url}/:gameId`, (req, res) => {
      this.Contorller.getGameById(req, res);
    });

    // 獲取玩家的遊戲歷史記錄
    this.router.get(`${this.url}/player/:playerId`, (req, res) => {
      this.Contorller.getPlayerGames(req, res);
    });

    // 獲取最近的遊戲記錄
    this.router.get(`${this.url}/recent`, (req, res) => {
      this.Contorller.getRecentGames(req, res);
    });

    // 更新遊戲狀態
    this.router.put(`${this.url}/:gameId/status`, (req, res) => {
      this.Contorller.updateGameStatus(req, res);
    });
  }
}

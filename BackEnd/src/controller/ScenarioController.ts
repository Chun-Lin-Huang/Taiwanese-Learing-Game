import { Contorller } from "../abstract/Contorller";
import { Request, Response } from "express";
import { ScenarioService } from "../Service/ScenarioService";
require("dotenv").config();

export class ScenarioController extends Contorller {
    protected service: ScenarioService;

    constructor() {
        super();
        this.service = new ScenarioService();
    }

    /**
     * 開始一個情境
     * POST /api/v1/scenario/start
     * body: { chatChooseId: string }
     */
    public async start(Request: Request, Response: Response) {
        try {
            const chatChooseId = (Request.body?.chatChooseId as string)?.trim();
            const userId = (Request.body?.userId as string)?.trim();
            if (!chatChooseId || !userId) {
                return Response.status(400).send({ code: 400, message: "缺少 chatChooseId 或 userId" });
            }
            const resp = await this.service.start(chatChooseId, userId);
            return Response.status(resp.code).send(resp);
        } catch (err: any) {
            return Response.status(500).send({ code: 500, message: err?.message || "server error" });
        }
    }

    /**
     * 送出一輪文字（先走文字對話）
     * POST /api/v1/scenario/turn_text
     * body: { session_id: string, text: string }
     */
    public async turnText(Request: Request, Response: Response) {
        try {
            const sessionId = (Request.body?.session_id as string | undefined)?.trim();
            const text = (Request.body?.text as string | undefined) ?? "";
            if (!sessionId || !text) {
                return Response.status(400).send({ code: 400, message: "缺少 session_id 或 text" });
            }
            const resp = await this.service.turnText(sessionId, text);
            return Response.status(resp.code).send(resp);
        } catch (err: any) {
            return Response.status(500).send({ code: 500, message: err?.message || "server error" });
        }
    }

    /**
     * 查詢 ChatHistory 記錄
     * GET /api/v1/scenario/history/:sessionId
     */
    public async getHistory(Request: Request, Response: Response) {
        try {
            const sessionId = Request.params?.sessionId;
            if (!sessionId) {
                return Response.status(400).send({ code: 400, message: "缺少 session_id" });
            }
            const resp = await this.service.getHistory(sessionId);
            return Response.status(resp.code).send(resp);
        } catch (err: any) {
            return Response.status(500).send({ code: 500, message: err?.message || "server error" });
        }
    }
}
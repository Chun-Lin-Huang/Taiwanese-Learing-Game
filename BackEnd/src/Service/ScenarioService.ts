// src/Service/ScenarioService.ts
import { Types } from "mongoose";
import crypto from "node:crypto";
import type { resp } from "../utils/resp";
import type { ScenarioStartResp, TurnResp } from "../interfaces/scenario";
import { ChatChooseModel } from "../orm/schemas/chatChooseSchemas";
import { ChatHistoryModel } from "../orm/schemas/chatHistorySchemas";

// === 內存 Session 狀態（加速；可由 DB 還原） ===
type SessionState = {
  title: string;              // 主題名稱（如：交通工具）
  turn: number;               // 當前回合
  score: number;              // 分數
  target_phrases: string[];   // 目標詞
  replies: string[];          // 逐回合回覆腳本
  max_turns: number;          // 最大回合
};
const SESS = new Map<string, SessionState>();

// === 腳本模板 ===
type ScriptTemplate = {
  opening: string;
  targets: string[];
  replies: string[];
  maxTurns: number;
};

/** 依主題名稱建立腳本（六個主題皆有專屬腳本） */
function buildTemplateByTopicName(topic: string): ScriptTemplate {
  // 1) 家庭與人物稱謂
  if (topic.includes("家庭") || topic.includes("人物")) {
    return {
      opening: "你好，欲介紹一下你的家族成員無？",
      targets: ["阿爸", "阿母", "阿兄", "阿姊"],
      replies: [
        "你家內面有啥人？（例：阿爸、阿母…）",
        "你佮家己人平常做啥活動？",
        "阮這馬講講兄弟姊妹，阿兄抑是阿姊？",
        "若有空，嘛會共做啥？",
      ],
      maxTurns: 6,
    };
  }

  // 2) 職業與社會角色
  if (topic.includes("職業") || topic.includes("角色")) {
    return {
      opening: "你長大後欲做啥物工作？",
      targets: ["老師", "醫生", "工程師"],
      replies: [
        "你對啥工作較有興趣？（老師、醫生、工程師…）",
        "彼个工作平常主要做啥？",
        "欲準備哪一項技能抑是證照？",
        "你認為彼个職業最大的價值是啥？",
      ],
      maxTurns: 6,
    };
  }

  // 預設
  return {
    opening: "歡迎光臨！欲開始講啥主題？",
    targets: [],
    replies: ["咱先簡單聊聊，欲分享啥？"],
    maxTurns: 6,
  };
}

export class ScenarioService {
  /** 啟動情境：由 chatChooseId + userId 產生一個 session，並建立 ChatHistory */
  async start(chatChooseId: string, userId: string): Promise<resp<ScenarioStartResp | undefined>> {
    const out: resp<ScenarioStartResp | undefined> = { code: 200, message: "", body: undefined };
    try {
      if (!Types.ObjectId.isValid(chatChooseId) || !Types.ObjectId.isValid(userId)) {
        out.code = 400; out.message = "invalid chatChooseId or userId"; return out;
      }

      const topic = await ChatChooseModel.findById(new Types.ObjectId(chatChooseId))
        .select("_id name")
        .lean();
      if (!topic) { out.code = 404; out.message = "chatChoose not found"; return out; }

      const tmpl = buildTemplateByTopicName(topic.name);

      // 1) 生成 session
      const sid = crypto.randomBytes(16).toString("hex");

      // 2) 寫入記憶體（快取）
      SESS.set(sid, {
        title: topic.name,
        turn: 1,
        score: 0,
        target_phrases: tmpl.targets,
        replies: tmpl.replies,
        max_turns: tmpl.maxTurns,
      });

      // 3) 寫入 DB：建立 ChatHistory（含開場白）
      await ChatHistoryModel.create({
        session_id: sid,
        userId: new Types.ObjectId(userId),
        chatChooseId: new Types.ObjectId(chatChooseId),
        title: topic.name,
        score: 0,
        turn: 1,
        finished: false,
        history: [{ role: "assistant", text: tmpl.opening }],
      });

      out.code = 200;
      out.message = "start success";
      out.body = {
        session_id: sid,
        npc_text: tmpl.opening,
        score: 0,
        finished: false,
      };
      return out;
    } catch {
      out.code = 500; out.message = "server error"; out.body = undefined; return out;
    }
  }

  /** 文字回合：寫入 DB 的 ChatHistory.history，並更新 turn/score/finished */
  async turnText(sessionId: string, text: string): Promise<resp<TurnResp | undefined>> {
    const out: resp<TurnResp | undefined> = { code: 200, message: "", body: undefined };
    try {
      const userText = (text ?? "").trim();
      if (!userText) { out.code = 400; out.message = "text is required"; return out; }

      // 1) 先從快取拿狀態；若沒有則由 DB 還原
      let st = SESS.get(sessionId);
      if (!st) {
        const found = await ChatHistoryModel.findOne({ session_id: sessionId })
          .select("title score turn finished")
          .lean();
        if (!found) { out.code = 400; out.message = "invalid session_id"; return out; }
        const tmpl = buildTemplateByTopicName(found.title);
        st = {
          title: found.title,
          score: found.score,
          turn: found.turn,
          target_phrases: tmpl.targets,
          replies: tmpl.replies,
          max_turns: tmpl.maxTurns,
        };
        SESS.set(sessionId, st);
      }

      // 2) 計分（命中目標詞 +2，上限 10）
      let score = st.score;
      for (const t of st.target_phrases) {
        if (t && userText.includes(t)) score = Math.min(10, score + 2);
      }

      // 3) 腳本回覆（依回合）
      const idx = Math.min(st.turn - 1, Math.max(0, st.replies.length - 1));
      let reply = st.replies[idx] || "咱繼續慢慢講～";

      // 4) 回合 + 完成判斷
      const nextTurn = st.turn + 1;
      const finished = nextTurn > st.max_turns || score >= 6;
      if (finished) reply += " 恁攏辦著矣，做得真好！";

      // 5) 寫入 DB：追加 user/assistant 訊息，更新 turn/score/finished
      await ChatHistoryModel.findOneAndUpdate(
        { session_id: sessionId },
        {
          $push: {
            history: {
              $each: [
                { role: "user", text: userText, ts: new Date() },
                { role: "assistant", text: reply, ts: new Date() },
              ],
            },
          },
          $set: { score, turn: nextTurn, finished },
        },
        { new: true }
      );

      // 6) 更新快取
      st.score = score;
      st.turn = nextTurn;

      out.code = 200;
      out.message = "turn success";
      out.body = {
        transcript: userText,
        reply_text: reply,
        finished,
        score,
        turn: nextTurn,
      };
      return out;
    } catch {
      out.code = 500; out.message = "server error"; out.body = undefined; return out;
    }
  }
}
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../style/Home.css";
import "../App.css";
import "../style/GameSelection.css";

import bearImage from "../assets/bear.png";
import backIcon from "../assets/Back.svg";

import TopicSelectionMenu from "../view/TopicSelectionMenu";
import type { TopicItem } from "../view/TopicSelectionMenu";
import { api } from "../enum/api";
import { asyncPost } from "../utils/fetch";

type ChatMsg = { type: "incoming" | "outgoing"; sender: string; content: React.ReactNode };

const Home: React.FC = () => {
  const navigate = useNavigate();

  // 對話狀態
  const [chatLog, setChatLog] = useState<ChatMsg[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [topic, setTopic] = useState<TopicItem | null>(null);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);

  // 是否顯示主題選單
  const [showTopicMenu, setShowTopicMenu] = useState(true);

  // 捲到最底的錨點
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatLog]);

  // 進入頁面：顯示提示
  useEffect(() => {
    setChatLog([
      {
        type: "incoming",
        sender: "小熊",
        content: <span>請先從主題選單選一個主題開始對話～</span>,
      },
    ]);
  }, []);

  /** 選主題 → 開始對話（POST /scenario/start） */
  const handleTopicClick = useCallback(async (t: TopicItem) => {
    try {
      // 使用者選單題（右邊泡泡）
      setChatLog(prev => [...prev, { type: "outgoing", sender: "你", content: <span>{t.name}</span> }]);

      const userId = localStorage.getItem("userId");
      if (!userId) throw new Error("尚未登入，缺少 userId");

      // 後端欄位：chatChooseId + userId
      const payload = { chatChooseId: t.id, userId };
      const startRes = await asyncPost(api.scenarioStart, payload);
      const body = startRes?.body ?? startRes ?? {};
      const sid: string | undefined = body.session_id || body.sessionId;
      const npcText: string = body.npc_text || body.npcText || "開始囉！";

      if (!sid) throw new Error("缺少 session_id");

      setSessionId(sid);
      setTopic(t);
      setShowTopicMenu(false); // 關閉主題選單

      // 小熊開場白（左邊泡泡）
      setChatLog(prev => [...prev, { type: "incoming", sender: "小熊", content: <span>{npcText}</span> }]);
    } catch (e: any) {
      setChatLog(prev => [
        ...prev,
        {
          type: "incoming",
          sender: "小熊",
          content: <span style={{ color: "#b00" }}>開始對話失敗：{e?.message || "未知錯誤"}</span>,
        },
      ]);
    }
  }, []);

  /** 每回合送出（POST /scenario/turn_text） */
  const handleSend = useCallback(async () => {
    if (!input.trim() || !sessionId) return;
    const userText = input.trim();
    setInput("");

    // 先把使用者話丟進對話
    setChatLog(prev => [...prev, { type: "outgoing", sender: "你", content: <span>{userText}</span> }]);

    setSending(true);
    try {
      const turnRes = await asyncPost(api.scenarioTurnText, {
        session_id: sessionId,
        text: userText,
      });
      const body = turnRes?.body ?? turnRes ?? {};
      const reply: string = body.reply_text || body.replyText || "……";
      const finished: boolean = !!body.finished;

      // 小熊回覆
      setChatLog(prev => [...prev, { type: "incoming", sender: "小熊", content: <span>{reply}</span> }]);

      if (finished) {
        // 對話結束，回到主題選單
        setSessionId(null);
        setTopic(null);
        setShowTopicMenu(true);
        setChatLog(prev => [
          ...prev,
          { type: "incoming", sender: "小熊", content: <span>本回合結束囉！再選一個主題吧～</span> },
        ]);
      }
    } catch (e: any) {
      setChatLog(prev => [
        ...prev,
        {
          type: "incoming",
          sender: "小熊",
          content: <span style={{ color: "#b00" }}>送出失敗：{e?.message || "未知錯誤"}</span>,
        },
      ]);
    } finally {
      setSending(false);
    }
  }, [input, sessionId]);

  /** 回主題選單（清空 session） */
  const resetChat = useCallback(() => {
    setSessionId(null);
    setTopic(null);
    setInput("");
    setShowTopicMenu(true);
    setChatLog([
      { type: "incoming", sender: "小熊", content: <span>請選擇想聊的主題～</span> },
    ]);
  }, []);

  return (
    <div className="selection-bg">
      <header className="selection-header">
        <button
          type="button"
          className="back-button"
          aria-label="返回"
          onClick={() => navigate("/Learn")}
        >
          <img src={backIcon} alt="返回" />
        </button>
        <div className="header-left">
          <h1 className="game-header-title">情境對話</h1>
        </div>
      </header>

      <main className="main-content">
        <div className="character-area">
          <button className="character-button" onClick={resetChat}>
            <img src={bearImage} alt="小熊" className="character-image" />
            <p className="character-caption">點我回主題選單</p>
          </button>
          <button onClick={resetChat} className="reset-button">
            重新開始對話
          </button>
        </div>

        <div className="chat-area">
          {/* 對話列 */}
          <div className="chat-log line-like">
            {chatLog.map((m, i) => (
              <div key={i} className={`message-row ${m.type}`}>
                {m.type === "incoming" && <span className="sender-name">小熊</span>}
                <div className={`bubble ${m.type}`}>{m.content}</div>
              </div>
            ))}

            {/* 主題選單顯示在對話列下方（只在 showTopicMenu=true 時出現） */}
            {showTopicMenu && (
              <div className="topic-menu-inline">
                <TopicSelectionMenu onTopicClick={handleTopicClick} />
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* 輸入列（沒 session 就禁止輸入） */}
          <div className="input-bar">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={sessionId ? "輸入想說的話…" : "請先選擇主題開始對話"}
              disabled={!sessionId || sending}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
            />
            <button
              onClick={handleSend}
              disabled={!sessionId || sending || !input.trim()}
              className="reset-button"
            >
              送出
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;
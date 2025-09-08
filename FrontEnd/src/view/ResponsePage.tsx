// src/view/ResponsePage.tsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../style/ResponsePage.css";
import "../App2.css";
import BackIcon from "../assets/Back.svg";

import { api } from "../enum/api";
import { asyncPost } from "../utils/fetch";

interface Message {
  id: string;
  type: "sent" | "received";
  sender: string;
  content: string;
}

type UserInfo = {
  _id: string;
  name?: string;
  userName?: string;
};

const ResponsePage: React.FC = () => {
  const navigate = useNavigate();

  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const contentRef = useRef<HTMLDivElement>(null);

  // 目前登入者名稱（預設顯示「使用者」）
  const [currentUserName, setCurrentUserName] = useState("使用者");

  // 初始化：讀取 localStorage 的 userInfo
  useEffect(() => {
    try {
      const raw = localStorage.getItem("userInfo");
      if (raw) {
        const info = JSON.parse(raw) as UserInfo;
        const name = info?.name || info?.userName;
        if (name) setCurrentUserName(name);
      }
    } catch {
      /* ignore */
    }
  }, []);

  // 送出訊息（按鈕 or Enter 都會呼叫）
  const handleSend = async () => {
    const text = input.trim();
    if (!text) return;

    // 使用者訊息
    const userMessage: Message = {
      id: crypto.randomUUID(),
      type: "sent",
      sender: currentUserName,
      content: text,
    };
    // 系統自動回覆
    const systemResponse: Message = {
      id: crypto.randomUUID(),
      type: "received",
      sender: "小熊",
      content: "已收到您的回覆",
    };

    // 先做樂觀更新，給使用者立即回饋
    setMessages((prev) => [...prev, userMessage, systemResponse]);
    setInput("");

    // 將提問記錄到後端
    try {
      await asyncPost(api.Question, {
        userName: currentUserName,
        questionText: text,
      });
    } catch (err) {
      console.error("問題記錄失敗：", err);
      // 可在這裡顯示錯誤提示（不影響前端對話顯示）
    }
  };

  // Enter 送出（處理 IME）
  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.nativeEvent as any).isComposing) return; // 中文輸入法選字時不要送
    if (e.key === "Enter") {
      e.preventDefault();
      handleSend();
    }
  };

  // 每次訊息更新後，捲到最底（確保自動回覆也一起進入視窗）
  useEffect(() => {
    if (!contentRef.current) return;
    const timer = setTimeout(() => {
      const last = contentRef.current!.querySelector(".msg-row:last-child");
      if (last instanceof HTMLElement) {
        last.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    }, 60);
    return () => clearTimeout(timer);
  }, [messages]);

  return (
    <div className="selection-bg">
      {/* Header */}
      <header className="game-header">
        <button
          type="button"
          className="back-button"
          aria-label="返回"
          onClick={() => navigate("/SettingsPage")}
        >
          <img src={BackIcon} alt="返回" />
        </button>
        <h1 className="header-title">問題反應</h1>
      </header>

      {/* Chat Area */}
      <main className="page-container">
        <div className="response-page">
          <div className="response-content" ref={contentRef}>
            {messages.map((msg) => (
              <div key={msg.id} className={`msg-row ${msg.type}`}>
                <div className="msg-wrap">
                  <div className="sender-name">{msg.sender}</div>
                  <div className="message-bubble">{msg.content}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Fixed Input Bar */}
      <div className="input-bar-fixed">
        <input
          type="text"
          className="input-placeholder"
          placeholder="輸入訊息..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleInputKeyDown}
        />
        <button className="send-button" onClick={handleSend}>
          送出
        </button>
      </div>
    </div>
  );
};

export default ResponsePage;
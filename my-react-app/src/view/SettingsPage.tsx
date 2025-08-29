import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../style/SettingsPage.css";
import "../App2.css";
import BackIcon from "../assets/Back.svg";
import avartBg from "../assets/avatar_bg.png";
import avatar from "../assets/avatar.png";
import edit from "../assets/edit.png";
import instructions from "../assets/instructions.png";
import response from "../assets/response.png";
import enter from "../assets/enter.png";

type UserInfo = {
  _id: string;
  name?: string;
  userName?: string;
};

const SettingsPage: React.FC = () => {
  const navigate = useNavigate();

  // 目前使用者名稱（預設顯示「使用者」）
  const [currentUserName, setCurrentUserName] = useState("使用者");

  useEffect(() => {
    // 1) 先從 localStorage 帶入（與你其它頁一致）
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

  return (
    <div className="page-bg">
      {/* Header */}
      <header className="game-header">
        <button
          type="button"
          className="back-button"
          aria-label="返回"
          onClick={() => navigate("/Learn")}
        >
          <img src={BackIcon} alt="返回" />
        </button>
        <h1 className="header-title">設定</h1>
      </header>

      {/* Main */}
      <main className="page-container">
        <section className="profile-content">
          {/* 使用者資訊 */}
          <div className="user-info">
            <div className="avatar">
              <img src={avartBg} className="avatar-background" alt="頭像背景" />
              <img src={avatar} className="avatar-icon" alt="使用者頭像" />
            </div>
            <p className="username">{currentUserName}</p>
          </div>

          {/* 選單 */}
          <nav className="settings-menu" aria-label="設定功能選單">
            <ul>
              <li>
                <div
                  className="menu-item"
                  onClick={() => navigate("/profileedit")}
                  role="button"
                >
                  <div className="menu-icon-container">
                    <img src={edit} alt="編輯資料圖示" />
                  </div>
                  <span className="menu-text">編輯資料</span>
                  <img src={enter} className="menu-arrow" alt="進入" />
                </div>
              </li>

              <li>
                <div
                  className="menu-item"
                  onClick={() => navigate("/InstructionsPage")}
                  role="button"
                >
                  <div className="menu-icon-container">
                    <img src={instructions} alt="使用說明圖示" />
                  </div>
                  <span className="menu-text">使用說明</span>
                  <img src={enter} className="menu-arrow" alt="進入" />
                </div>
              </li>

              <li>
                <div
                  className="menu-item"
                  onClick={() => navigate("/ResponsePage")}
                  role="button"
                >
                  <div className="menu-icon-container">
                    <img src={response} alt="問題反應圖示" />
                  </div>
                  <span className="menu-text">問題反應</span>
                  <img src={enter} className="menu-arrow" alt="進入" />
                </div>
              </li>
            </ul>
          </nav>
        </section>
      </main>

      {/* 開發用快捷按鈕（非 production 顯示） */}
      {import.meta.env.MODE !== "production" && (
        <button
          type="button"
          onClick={() => navigate("/notifications")}
          aria-label="前往通知頁（開發用）"
          style={{
            position: "fixed",
            right: 20,
            bottom: 100,
            zIndex: 2000,
            padding: "8px 12px",
            background: "#333",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            opacity: 0.7,
          }}
        >
          通知頁（開發）
        </button>
      )}
    </div>
  );
};

export default SettingsPage;
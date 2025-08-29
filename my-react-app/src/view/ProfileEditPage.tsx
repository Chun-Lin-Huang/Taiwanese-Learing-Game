import React, { useState, useEffect, type ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../style/ProfileEditPage.css"; 
import BackIcon from "../assets/Back.svg";
import  avartBg from"../assets/avatar_bg.png";
import avatar from"../assets/avatar.png";
import { api } from "../enum/api";
import { asyncPut } from "../utils/fetch";

const defaultAvatar = avatar;

type UserInfo = {
  _id: string;
  name: string;
  userName: string;
  createdAt?: string;
  updatedAt?: string;
};

const ProfileEditPage: React.FC = () => {
  const navigate = useNavigate();

  // 只做顯示用（不跟輸入框連動）
  const [displayName, setDisplayName] = useState("");
  const [displayUsername, setDisplayUsername] = useState("");

  // 編輯用輸入框（預設空字串 → 只顯示 placeholder）
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");

  const [avatarPreview, setAvatarPreview] = useState(defaultAvatar);
  const [submitting, setSubmitting] = useState(false);

  // 初始化：從 localStorage 帶入顯示用資訊
  useEffect(() => {
    try {
      const raw = localStorage.getItem("userInfo");
      if (raw) {
        const info = JSON.parse(raw) as UserInfo;
        setDisplayName(info.name || "");
        setDisplayUsername(info.userName || "");
        // 注意：不把 input 的 value 設成這些值，讓 input 只顯示 placeholder
      }
    } catch {
      /* ignore */
    }
  }, []);

  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setAvatarPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const userId = localStorage.getItem("userId");
    if (!userId) {
      toast.error("尚未登入或找不到使用者 ID，請先登入再試。", { position: "top-center" });
      navigate("/login");
      return;
    }

    // 只帶有填寫的欄位
    const payload: Record<string, any> = { _id: userId };
    if (fullName.trim()) payload.name = fullName.trim();
    if (username.trim()) payload.userName = username.trim();
    // 若兩個都沒填，就不送
    if (!payload.name && !payload.userName) {
      toast.info("請至少編輯一項資料再送出", { position: "top-center" });
      return;
    }

    setSubmitting(true);
    try {
      const resp = await asyncPut(api.update, payload);

      // 非 2xx 會在 asyncPut 丟錯；所以這裡視為成功或 resp?.code === 200 都可以
      if (!resp || resp?.code === 200) {
        // 同步更新顯示文字與 localStorage
        const nextName = payload.name ?? displayName;
        const nextUserName = payload.userName ?? displayUsername;

        setDisplayName(nextName);
        setDisplayUsername(nextUserName);

        const old = JSON.parse(localStorage.getItem("userInfo") || "{}");
        localStorage.setItem(
          "userInfo",
          JSON.stringify({
            ...old,
            _id: userId,
            name: nextName,
            userName: nextUserName,
          })
        );

        // 清空輸入框，回到只顯示 placeholder 的狀態
        setFullName("");
        setUsername("");

        toast.success("資料更新成功！", { position: "top-center", autoClose: 2000 });
      } else {
        toast.error(resp?.message || "更新失敗，請稍後再試", { position: "top-center" });
      }
    } catch (err) {
      console.error(err);
      const msg = err instanceof Error ? err.message : "無法連線到伺服器";
      toast.error(msg, { position: "top-center" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    navigate("/SettingsPage");
  };

  return (
    <section id="profile-change" className="page-bg">
      {/* 頁面頂部橫幅 */}
      <header className="game-header">
         <button
          type="button"
          className="back-button"
          aria-label="返回"
          onClick={() => navigate("/SettingsPage")}
        >
          <img src={BackIcon} alt="返回" />
        </button>
        <h1 className="header-title">個人資料變更</h1>
      </header>

      {/* 表單內容 */}
      <main className="profile-content">
        <form className="profile-form" onSubmit={handleSubmit}>

          {/* 頭像區 */}
          <div className="avatar-section">
            <div className="avatar-wrapper">
              <img
                src={avartBg}
                className="avatar-bg"
                alt="Avatar background"
              />
              <img
                src={avatarPreview}
                className="avatar-icon"
                alt="User avatar"
              />
            </div>

            {/* 顯示目前使用者姓名 + 使用者名稱 */}
            <p className="avatar-change-label">
              {displayName || "使用者"} {displayUsername ? `(${displayUsername})` : ""}
            </p>

            <label htmlFor="avatar-input" className="avatar-change-label"></label>
            <input
              id="avatar-input"
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              style={{ display: "none" }}
            />
          </div>

          {/* 輸入欄位 */}
          <div className="form-fields">
            <div className="form-group">
              <label htmlFor="full-name" className="form-label">編輯姓名</label>
              <input
                type="text"
                id="full-name"
                className="form-input"
                placeholder="請編輯姓名"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="username" className="form-label">編輯使用者名稱</label>
              <input
                type="text"
                id="username"
                className="form-input"
                placeholder="請編輯使用者名稱"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          </div>

          {/* 按鈕 */}
          <div className="form-actions">
            <button type="submit" className="btn btn-confirm" disabled={submitting}>
              {submitting ? "送出中…" : "確定"}
            </button>
            <button type="button" className="btn btn-cancel" onClick={handleReset}>取消</button>
          </div>
        </form>
      </main>

      {/* Toast提示 */}
      <ToastContainer />
    </section>
  );
};

export default ProfileEditPage;
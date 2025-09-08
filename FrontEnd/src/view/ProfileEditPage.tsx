// src/view/ProfileEditPage.tsx
import React, { useState, useEffect, type ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../style/ProfileEditPage.css";
import BackIcon from "../assets/Back.svg";
import avartBg from "../assets/avatar_bg.png";
import avatar from "../assets/avatar.png";
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

  // 編輯用輸入框
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");

  const [avatarPreview, setAvatarPreview] = useState(defaultAvatar);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("userInfo");
      if (raw) {
        const info = JSON.parse(raw) as UserInfo;
        setDisplayName(info.name || "");
        setDisplayUsername(info.userName || "");
      }
    } catch {}
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

    if (!payload.name && !payload.userName) {
      toast.info("請至少編輯一項資料再送出", { position: "top-center" });
      return;
    }

    setSubmitting(true);
    try {
      const resp = await asyncPut(api.update, payload);

      // 依照後端的錯誤格式判斷
      const code = resp?.code ?? resp?.status;

      if (code && code !== 200) {
        if (code === 409) {
          toast.error(resp?.message || "使用者名稱已有人使用", { position: "top-center" });
        } else {
          toast.error(resp?.message || "更新失敗，請稍後再試", { position: "top-center" });
        }
        return; // 結束，不進入成功流程
      }

      if (resp && resp.success === false) {
        toast.error(resp?.message || "更新失敗，請稍後再試", { position: "top-center" });
        return;
      }

      // 成功：同步畫面與 localStorage
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

      setFullName("");
      setUsername("");

      toast.success("資料更新成功！", { position: "top-center", autoClose: 2000 });
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

      <main className="profile-content">
        <form className="profile-form" onSubmit={handleSubmit}>
          <div className="avatar-section">
            <div className="avatar-wrapper">
              <img src={avartBg} className="avatar-bg" alt="Avatar background" />
              <img src={avatarPreview} className="avatar-icon" alt="User avatar" />
            </div>

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

          <div className="form-actions">
            <button type="submit" className="btn btn-confirm" disabled={submitting}>
              {submitting ? "送出中…" : "確定"}
            </button>
            <button type="button" className="btn btn-cancel" onClick={handleReset}>取消</button>
          </div>
        </form>
      </main>

      <ToastContainer />
    </section>
  );
};

export default ProfileEditPage;
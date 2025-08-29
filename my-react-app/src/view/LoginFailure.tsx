// 註冊失敗 → 重新登入頁（實際呼叫後端登入 API）
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../style/LoginFailure.css";
import "../Login.css";
import "../Main.css";
import cryBearImage from "../assets/crybear.png";
import { api } from "../enum/api";
import { asyncPost } from "../utils/fetch";

// 後端回傳型別（可與 Login.tsx 共用）
type LoginBody = {
  _id: string;
  name: string;
  userName: string;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
};
type LoginResponse = {
  code: number;
  message: string;
  body?: LoginBody;
};

const LoginFailure: React.FC = () => {
  const navigate = useNavigate();
  const [username, setUsername]   = useState("");
  const [password, setPassword]   = useState("");
  const [error, setError]         = useState<string | null>(null);
  const [loading, setLoading]     = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const resp = (await asyncPost(api.login, {
        userName: username,   // 後端鍵：userName
        password: password,
      })) as LoginResponse;

      if (resp?.code === 200 && resp?.body?._id) {
        // 暫存使用者資訊（跨頁/重整仍在）
        localStorage.setItem("userId", resp.body._id);
        localStorage.setItem("userInfo", JSON.stringify(resp.body));

        navigate("/LoginSuccess");
      } else {
        throw new Error(resp?.message || "登入失敗，請確認帳號密碼");
      }
    } catch (err: any) {
      console.error(err);
      setError(err?.message ?? "登入失敗，請稍後再試");
      // 失敗時留在本頁，讓使用者可再試一次
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        {/* 左邊哭哭熊（圖片已內含登入失敗文字） */}
        <div className="welcome-panel">
          <img src={cryBearImage} alt="哭哭熊" className="mascot-image" />
        </div>

        {/* 右邊重新登入表單 */}
        <div className="form-panel">
          <div className="login-tabs">
            <a href="#" className="tab-link active" onClick={(e) => e.preventDefault()}>
              登入
            </a>
            <Link to="/Register" className="tab-link">
              註冊
            </Link>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="請輸入使用者名稱"
              className="form-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              required
            />
            <input
              type="password"
              placeholder="請輸入密碼"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
            <button type="submit" className="submit-button" disabled={loading}>
              {loading ? "登入中…" : "重新登入"}
            </button>

            {error && <p className="error-text" style={{ marginTop: 8 }}>{error}</p>}
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginFailure;
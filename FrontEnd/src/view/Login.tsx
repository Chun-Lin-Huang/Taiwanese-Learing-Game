import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../Login.css";
import "../Main.css" 
import "../App.css";
import bearImage from "../assets/bear.png";
import { api } from "../enum/api";
import { asyncPost } from "../utils/fetch";

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState<string | null>(null);
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // 後端要求的欄位名稱：userName / password
      const resp = await asyncPost(api.login, {
        userName: username,
        password: password,
      });

      if (resp?.code === 200 && resp?.body?._id) {
        // ✅ 登入成功：暫存 id 與整份 body 到 localStorage（跨頁/重整都保留）
        localStorage.setItem("userId", resp.body._id);
        localStorage.setItem("userInfo", JSON.stringify(resp.body));

        // 若後端還有回傳 token，可一併保存
        // if ((resp as any).token) localStorage.setItem("token", (resp as any).token);

        console.log("登入成功，已暫存 userId:", resp.body._id);
        navigate("/LoginSuccess");
      } else {
        throw new Error(resp?.message || "登入失敗");
      }
    } catch (err) {
      console.error(err);
      const msg = err instanceof Error ? err.message : "登入失敗";
      setError(msg);
      navigate("/LoginFailure");
    } finally {
      setLoading(false);
    }
  };

  return (
    // 使用 .login-page 類別作為最外層容器
    <div className="login-page"> {/* 將 selection-bg 替換為 login-page */}
      
      <div className="login-container">
        {/* 左邊小熊與標題 */}
        <div className="welcome-panel">
          <h1 className="welcome-title">歡迎</h1>
          <img src={bearImage} alt="小熊" className="mascot-image" />
        </div>

        {/* 右邊表單卡片 */}
        <div className="form-panel">
          <div className="login-tabs">
            <a href="#" className="tab-link active" onClick={(e) => e.preventDefault()}>登入</a>
            <a href="/Register" className="tab-link">註冊</a>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="請輸入使用者名稱" /* 更新 placeholder */
              className="form-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              required
            />
            <input
              type="password"
              placeholder="請輸入密碼" /* 更新 placeholder */
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
            <button type="submit" className="submit-button" disabled={loading}>
              {loading ? "登入中…" : "登入"}
            </button>
            {error && <p className="error-text">{error}</p>}
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
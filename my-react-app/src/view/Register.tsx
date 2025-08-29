// 註冊 Register.tsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../style/Register.css";
import "../Main.css";
import "../Login.css";
import bearImage from "../assets/bear.png";
import { api } from "../enum/api";
import { asyncPost } from "../utils/fetch";
import { toast } from "react-toastify";

type UserDoc = {
  _id: string;
  name: string;
  userName: string;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
};

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setError(null);

    if (!name.trim() || !username.trim() || !password) {
      setError("請完整填寫必填欄位");
      toast.error("請完整填寫必填欄位");
      return;
    }
    if (password !== confirmPassword) {
      setError("兩次輸入的密碼不一致");
      toast.error("兩次輸入的密碼不一致");
      return;
    }

    setLoading(true);
    try {
      const resp = await asyncPost(api.register, {
        name: name.trim(),
        userName: username.trim(),
        password,
      });

      const user: UserDoc | undefined = resp?.body ?? resp;

      if (user && user._id) {
        // ✅ 註冊成功提示（App.tsx 全域 ToastContainer 會顯示在上方正中）
        toast.success("註冊成功，請登入帳號！", {
          onClose: () => navigate("/login"),
        });

        // （可選）暫存使用者資料
        localStorage.setItem("userId", user._id);
        localStorage.setItem(
          "userInfo",
          JSON.stringify({
            _id: user._id,
            name: user.name,
            userName: user.userName,
          })
        );
      } else {
        throw new Error("註冊回應格式不含 _id");
      }
    } catch (err) {
      console.error(err);
      const msg = err instanceof Error ? err.message : "註冊失敗";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const isDisabled =
    loading || !name.trim() || !username.trim() || !password || !confirmPassword;

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="welcome-panel">
          <h1 className="welcome-title">歡迎</h1>
          <img src={bearImage} alt="小熊" className="mascot-image" />
        </div>

        <div className="form-panel">
          <div className="login-tabs">
            <Link to="/Login" className="tab-link">
              登入
            </Link>
            <a href="#" className="tab-link active" onClick={(e) => e.preventDefault()}>
              註冊
            </a>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="請輸入姓名"
              className="form-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="請輸入使用者名稱"
              className="form-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="請輸入密碼"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="請再次輸入密碼"
              className="form-input"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />

            <button type="submit" className="submit-button" disabled={isDisabled}>
              {loading ? "送出中…" : "確定"}
            </button>

            {error && <p className="error-text">{error}</p>}
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
import React from "react";
import { useNavigate } from "react-router-dom";
import "../style/RegisterFailure.css";
import "../Main.css";
import "../style/Register.css";
import "../Login.css";
//import backgroundImage from "../assets/background.png";
import cryBearImage from "../assets/crybear2.png";

const RegisterFailure: React.FC = () => {
  const navigate = useNavigate();

  return (
     <div className="login-page"> {/* 將 selection-bg 替換為 login-page */}
      
      <div className="login-container">
        <div className="welcome-panel">
          <h1 className="welcome-title">註冊失敗！</h1>
          <img src={cryBearImage} alt="哭熊" className="mascot-image" />
        </div>

        <div className="form-panel">
          <div className="message-card">
            <p className="message-text">請檢查資料後再試一次</p>
            <button className="submit-button" onClick={() => navigate("/Register")}>
              返回註冊
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterFailure;

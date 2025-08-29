//登入成功歡迎頁面
import React from "react";
import { useNavigate } from "react-router-dom";
import "../style/LoginSuccess.css";
import "../Main.css";
import "../Login.css"
//import backgroundImage from "../assets/background.png";
import happyBearImage from "../assets/bear.png"; 


const LoginSuccess: React.FC = () => {
  const navigate = useNavigate();

  const handleEnterHome = () => {
    navigate("/Learn"); // 要改
  };

  return (
     <div className="login-page"> {/* 將 selection-bg 替換為 login-page */}
      
      <div className="login-container">
        <h1 className="success-message">登入成功<br />歡迎回來</h1>
        <img
          src={happyBearImage}
          alt="小熊"
          className="mascot-image"
          onClick={handleEnterHome}
        />
      </div>
    </div>
  );
};

export default LoginSuccess;

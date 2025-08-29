//登入成功歡迎頁面
import React from "react";
import { useNavigate } from "react-router-dom";
import "../style/First.css"; // 確保這個 CSS 文件正確引入
import "../Main.css";
import "../Login.css"



import welcomeText from "../assets/歡迎.png"; 
const First: React.FC = () => {
  const navigate = useNavigate();

  const handleEnterHome = () => {
    navigate("/Welcome"); 
  };

  return (
   
    <div id="login-success-page" onClick={handleEnterHome}>
      
      <img
        src={welcomeText}
        alt="Welcome"
        className="welcome-text-image" // 給 Welcome 文字一個獨立的類名
      />
    </div>
  );
};

export default First;
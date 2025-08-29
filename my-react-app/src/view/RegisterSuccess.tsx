import React from "react";
import { useNavigate } from "react-router-dom";
import "../style/LoginSuccess.css";
import "../Main.css";
import "../Login.css"
import bearImage from "../assets/帽子小熊.png";

const RegisterSuccess: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="login-page"> 
      
      <div className="login-container">
        <h1 className="success-message">登入成功<br /></h1>
        <img
          src={ bearImage}
          alt="小熊"
          className="mascot-image"
        
        />
      </div>
        <div className="form-panel">
          <div className="message-card">
            <p className="message-text">請登入以繼續使用</p>
            <button className="submit-button" onClick={() => navigate("/login")}>
              返回登入
            </button>
          </div>
        </div>
      </div>
  );
};

export default RegisterSuccess;

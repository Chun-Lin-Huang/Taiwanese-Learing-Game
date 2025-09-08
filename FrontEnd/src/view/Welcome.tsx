import React from "react";
import { useNavigate } from "react-router-dom";
import "../style/Welcome.css";
import backgroundImage from "../assets/背景.png";
import bearImage from "../assets/bear.png";

const Welcome: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section
      id="hero"
      style={{
        backgroundImage: `url(${backgroundImage})`,
      }}
    >
      <div className="hero-container">
        <h1 className="hero-title">歡迎</h1>
        <img src={bearImage} alt="小熊" className="hero-bear-image" />
        <p className="hero-subtitle">快跟著智能小熊學習台語吧！</p>
        <p className="hero-description">我們等你很久了，快去試試吧~</p>
        <a className="start-button" onClick={() => navigate("/login")}>
          開始
        </a>
      </div>
    </section>
  );
};

export default Welcome;

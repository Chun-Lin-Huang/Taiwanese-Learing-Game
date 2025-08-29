import React from "react";
import { useNavigate } from "react-router-dom";
import "../App2.css"; // 全站共用樣式
import "../style/First.css"; // 本頁專屬樣式
import BackIcon from "../assets/Back.svg";
const InstructionsPage: React.FC = () => {
  // React Router 導航 Hook
  const navigate = useNavigate();

  // ===== 返回首頁事件處理 =====
  // 點擊返回按鈕時，阻止預設行為並導回首頁
 

  return (
    <main className="instructions-container page-bg">
      {/* ===== 頁首（Header 區） ===== */}
      <header className="game-header">
         <button
          type="button"
          className="back-button"
          aria-label="返回"
          onClick={() => navigate("/Learn")}
        >
          <img src={BackIcon} alt="返回" />
        </button>
        
        <h1 className="header-title">使用說明</h1>
      </header>

      {/* ===== 後續可放「使用說明內容」 ===== */}
    </main>
  );
};

export default InstructionsPage;

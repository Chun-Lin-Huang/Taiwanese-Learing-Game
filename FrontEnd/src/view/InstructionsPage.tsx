import React from "react";
import { useNavigate } from "react-router-dom";
import "../App2.css"; // 全站共用樣式
import "../style/InstructionsPage.css"; // 本頁專屬樣式
import BackIcon from "../assets/Back.svg";
const InstructionsPage: React.FC = () => {
  const navigate = useNavigate();


  

  return (
    <div className="selection-bg">
      <header className="selection-header">
        <button
          type="button"
          className="back-button"
          aria-label="返回"
          onClick={() => navigate("/SettingsPage")}
        >
          <img src={BackIcon} alt="返回" />
        </button>
        <h1 className="game-header-title">使用說明</h1>
      </header>

      {/* ===== 使用說明內容 ===== */}
      <section className="main-content">
        <div className="content-wrapper">

          {/* 主頁面 */}
          <h2 className="card-section-title">主頁面</h2>
          <div className="card-placeholder">
            <img src="/images/screenshot.png" alt="主頁面示意" className="card-image" />
          </div>
          <p className="content-description">
            我們主頁面會有四個功能可以用來學習台語，分別是台語單字卡、情境對話、互動遊戲、台語故事集，點選即可進入相對應的頁面。
            主頁面上方橫幅也有通知、設定、登出，點選圖示也可進入相對應的頁面。
          </p>

          {/* 通知 */}
          <h2 className="card-section-title">通知</h2>
          <div className="card-placeholder">
            <img src="/images/notification.png" alt="通知示意" className="card-image" />
          </div>
          <p className="content-description">
            點選通知圖示可查看最新提醒與訊息。
          </p>

          {/* 設定 */}
          <h2 className="card-section-title">設定</h2>
          <div className="card-placeholder">
            <img src="/images/settings.png" alt="設定示意" className="card-image" />
          </div>
          <p className="content-description">
            點選設定圖示會先進入設定頁面，總共有三個功能可以使用，分別是個人資料編輯、使用說明與問題反應的功能。<br /><br />
            1. 個人資料編輯 - 填入要編輯的姓名與使用名稱後，再送出即可。<br /><br />
            2. 使用說明 - 就是此頁面，當有不明白怎麼操作此應用程式時，可以來這裡查看。<br /><br />
            3. 問題反映 - 當使用此應用網頁遇到問題時，可以到問題反映頁面輸入遇到的問題，我們會收到並解決你的問題。<br /><br />
          </p>

          {/* 登出 */}
          <h2 className="card-section-title">登出</h2>
          <div className="card-placeholder">
            <img src="/images/logout.png" alt="登出示意" className="card-image" />
          </div>
          <p className="content-description">
            點選登出圖示即可安全登出帳號。
          </p>

          {/* 台語單字卡 */}
          <h2 className="card-section-title">台語單字卡</h2>
          <div className="card-placeholder">
            <img src="/images/flashcard.png" alt="台語單字卡示意" className="card-image" />
          </div>
          <p className="content-description">
            Step 1  - 我們的單字卡都有分類主題，請先選擇主題，透過單字卡學習各個主題的台語單字，並點選卡片右上角播放圖示跟著學習台語發音。<br /><br />
            Step 2  - 在學習的過程中，將比較不熟悉的單字，點擊卡片右上角的星號，收藏起來。<br /><br />
            Step 3  - 時不時地回來，點選頁面右上角的收藏集，去複習不熟悉的台語單字發音，讓自己更加印象深刻。
          </p>

          {/* 情境對話 */}
          <h2 className="card-section-title">情境對話</h2>
          <div className="card-placeholder">
            <img src="/images/dialog.png" alt="情境對話示意" className="card-image" />
          </div>
          <p className="content-description">
            Step 1  - 進入到頁面先選擇對話的主題<br /><br />
            Step 2  - 點選左邊小熊開始進行對話，模擬日常生活對話，練習台語溝通能力<br /><br />
            Step 3  - 可點擊下方按鈕重新開始對話
          </p>

          {/* 互動遊戲 */}
          <h2 className="card-section-title">互動遊戲</h2>
          <div className="card-placeholder">
            <img src="/images/game.png" alt="互動遊戲示意" className="card-image" />
          </div>
          <p className="content-description">
            進入到頁面先選擇遊戲主題，點進去就可以開始進行互動遊戲，透過遊戲互動，加深台語學習趣味。
          </p>

          {/* 台語故事集 */}
          <h2 className="card-section-title">台語故事集</h2>
          <div className="card-placeholder">
            <img src="/images/story.png" alt="台語故事集示意" className="card-image" />
          </div>
          <p className="content-description">
            1. 進入頁面會有許多台語故事可以選擇，也可以透過上方搜尋欄，搜尋故事，故事點進去可以點擊播放圖示跟著學習台語唸法，透過閱讀台語故事，提升閱讀與理解能力。<br /><br />
            2. 每一個故事右邊都有一個愛心按鈕可以珍藏喜歡的故事，在頁面的右上角有一個收藏集，裡面就能清楚看到珍藏的所有故事。
          </p>

        </div>
      </section>
    </div>
  );
};

export default InstructionsPage;
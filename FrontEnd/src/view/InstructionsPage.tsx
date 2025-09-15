import React from "react";
import { useNavigate } from "react-router-dom";
import "../App2.css"; // 全站共用樣式
import "../style/InstructionsPage.css"; // 本頁專屬樣式
import BackIcon from "../assets/Back.svg";
import main from "../assets/主畫面示意.png";
import settings from "../assets/設定示意.png";
import logout from "../assets/登出示意.png";
import flashcard from "../videos/flashcard.mp4";
import dialog from "../videos/chat.mp4";
import game from "../videos/game.mp4";
import story from "../videos/story.mp4";
import dictionary from "../assets/台語辭典.png";
// import monopoly from "../assets/超級大富翁示意.png";

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
            <img src={main} alt="主頁面示意" className="card-image" />
          </div>
          <p className="content-description">
            導航欄：有設定和登出，點選圖示即可進入相對應的頁面。<br /><br />
            內容：有六個功能分別為台語單字卡、情境對話、互動遊戲、台語故事集、台語辭典、超級大富翁，點選即可進入相對應的頁面。
          </p>


          {/* 設定 */}
          <h2 className="card-section-title">設定</h2>
          <div className="card-placeholder">
            <img src={settings} alt="設定示意" className="card-image" />
          </div>
          <p className="content-description">
            點選設定圖示會進入設定頁面，總共有三個功能可以使用，分別是資料編輯、使用說明與問題反應。<br /><br />
            1. 資料編輯 - 填入要編輯的姓名或使用名稱後按送出即可。<br /><br />
            2. 使用說明 - 此平台有不明白要如何操作時，可以進來查看。<br /><br />
            3. 問題反映 - 當使用上有遇到問題時，可以到問題反映頁面輸入所遇到的問題，我們將會收到並解決。<br /><br />
          </p>

          {/* 登出 */}
          <h2 className="card-section-title">登出</h2>
          <div className="card-placeholder">
            <img src={logout} alt="登出示意" className="card-image" />
          </div>
          <p className="content-description">
            點選登出圖示即可安全登出帳號。
          </p>

          {/* 台語單字卡 */}
          <h2 className="card-section-title">台語單字卡</h2>
          <div className="card-placeholder">
            <video
              src={flashcard}
              className="card-image"
              controls
              preload="metadata"
            >
              您的瀏覽器不支援影片播放。
            </video>
          </div>
          <p className="content-description">
            Step 1 - 點選想學習的主題。<br /><br />
            Step 2 - 點選想學習的單字圖卡，會有聲音播放鍵和單字卡按鍵。<br /><br />
            Step 3 - 點選單字卡按鍵，會有單字卡詞彙的詳細介紹，單字卡上有播放鍵與星星符號的收藏鍵。<br /><br />
            Step 4 - 點選單字卡學習頁面右上角的收藏集，單字卡收藏會收入到此頁面。
          </p>

          {/* 情境對話 */}
          <h2 className="card-section-title">情境對話</h2>
          <div className="card-placeholder">
            <video
              src={dialog}
              className="card-image"
              controls
              preload="metadata"
            >
              您的瀏覽器不支援影片播放。
            </video>
          </div>
          <p className="content-description">
            Step 1 - 選擇對話的主題。<br /><br />
            Step 2 - 點選右下方「開始語音對話」按鈕開始進行對話，模擬日常生活對話，練習台語溝通能力。<br /><br />
            Step 3 - 若要重新選擇對話主題，可點擊小熊下方按鈕重新開始對話。
          </p>

          {/* 互動遊戲 */}
          <h2 className="card-section-title">互動遊戲</h2>
          <div className="card-placeholder">
            <video
              src={game}
              className="card-image"
              controls
              preload="metadata"
            >
              您的瀏覽器不支援影片播放。
            </video>
          </div>
          <p className="content-description">
            進入到頁面先選擇遊戲主題，左右滑動可以觀看主題選項，點進去就可以開始進行互動遊戲，透過遊戲互動，加深台語學習趣味。
          </p>

          {/* 台語故事集 */}
          <h2 className="card-section-title">台語故事集</h2>
          <div className="card-placeholder">
            <video
              src={story}
              className="card-image"
              controls
              preload="metadata"
            >
              您的瀏覽器不支援影片播放。
            </video>
          </div>
          <p className="content-description">
            1. 進入頁面會有許多台語故事可以選擇，也可以透過上方搜尋欄，搜尋故事，故事點進去可以點擊播放圖示跟著學習台語唸法，透過閱讀台語故事，提升閱讀與理解能力。<br /><br />
            2. 每一個故事右邊都有一個愛心按鈕可以珍藏喜歡的故事，在頁面的右上角有一個收藏集，裡面就能清楚看到珍藏的所有故事。
          </p>

          {/* 台語辭典 */}
          <h2 className="card-section-title">台語辭典</h2>
          <div className="card-placeholder">
            <img src={dictionary} alt="台語辭典示意" className="card-image" />
          </div>
          <p className="content-description">
            進入此頁面，可以查詢教育部所收錄的台語單詞，在輸入框輸入想查詢的單詞，可以查詢到詞目、音讀、釋義，且音讀是可以播出聲音聽唸法的。
          </p>

          {/* 超級大富翁 */}
          <h2 className="card-section-title">超級大富翁</h2>
          <p className="content-description">
            當遊玩實體桌遊時，需連動我們平台的大富翁，即此頁面，詳細說明請參照我們的實體遊戲說明書。
          </p>

        </div>
      </section>
    </div>
  );
};

export default InstructionsPage;
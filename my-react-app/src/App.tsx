import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";

//遊戲區
import Home from './view/Home'
import ScoreDisplay from "./view/ScoreDisplay";
import LearningMode from './view/LearningMode';
import GameQuestion from "./view/GameQuestion";
import GameMain from "./view/GameMain";
import GameSelection2 from "./view/GameSelection2";

//小琳區
import StoryModePage from "./view/StoryModePage";
import ThemeSelectionPage from "./view/ThemeSelectionPage";
import FavoriteCollectionPage from "./view/FavoriteCollectionPage";
import FlashcardApp from './view/FlashcardApp';
import LoveStoryPage from "./view/LoveStoryPage";
//import StoryDetailPage from './view/StoryDetailPage';


//王跌跌區
import InstructionsPage from "./view/InstructionsPage";
import NotificationPage from "./view/NotificationPage";
import SettingsPage from "./view/SettingsPage";
import ProfileEditPage from "./view/ProfileEditPage";
import ResponsePage from "./view/ResponsePage";

//登入盧冠寧區
import Login from "./view/Login";
import LoginFailure from "./view/LoginFailure";
import LoginSuccess from "./view/LoginSuccess";
import Register from "./view/Register";
import RegisterFailure from "./view/RegisterFailure";
import First from "./view/First";
import RegisterSuccess from "./view/RegisterSuccess";
import Welcome from "./view/Welcome";


import "./Main.css";
import "./App.css";
import "./style/Game.css";
import "./Login.css";

export default function App() {
  return (
    <Router>
      <div className="app-container">
        <Routes>
          {/*登入 */}
          <Route path="/" element={<First />} />
          <Route path="/Login" element={<Login />} />
          <Route path="/LoginFailure" element={<LoginFailure />} />
          <Route path="/LoginSuccess" element={<LoginSuccess />} />
          <Route path="/Home" element={<Home />} />
          <Route path="/Register" element={<Register />} />
          <Route path="/RegisterFailure" element={<RegisterFailure />} />
          <Route path="/RegisterSuccess" element={<RegisterSuccess />} />
          <Route path="/Welcome" element={<Welcome />} />


          {/*小琳區 */}
          <Route path="/ThemeSelection" element={<ThemeSelectionPage />} />
          <Route path="/Learn" element={<LearningMode />} />
          <Route path="/FlashcardApp" element={<FlashcardApp onBack={function (): void {
            throw new Error("Function not implemented.");
          }} />} />
          <Route path="/FavoriteCollection" element={<FavoriteCollectionPage />} />
          <Route path="/StoryModePage" element={<StoryModePage onBack={function (): void {
            throw new Error("Function not implemented.");
          }} onStoryClick={function (story: { id: number; title: string; }): void {
            throw new Error("Function not implemented.");
          }} />} />
          <Route path="/LoveStoryPage" element={<LoveStoryPage />} />


          {/*王跌跌區 */}
          <Route path="/NotificationPage" element={<NotificationPage />} />
          <Route path="/SettingsPage" element={<SettingsPage />} />
          <Route path="/ResponsePage" element={<ResponsePage />} />
          <Route path="/profileedit" element={<ProfileEditPage />} />
          <Route path="/InstructionsPage" element={<InstructionsPage />} />




          {/* 遊戲相關路由 */}

          <Route path="/GameMain" element={<GameMain />} />
          <Route path="/GameSelection2" element={<GameSelection2 />} />
          <Route path="/GameQuestion" element={<GameQuestion />} />
          <Route path="/ScoreDisplay" element={<ScoreDisplay />} />

          {/* 新增收藏頁面路由 */}

          <Route path="/favorites" element={<FavoriteCollectionPage />} />

        </Routes>

        {/* ✅ 全域提示框容器（全站只要掛一次） */}
        <ToastContainer
          position="top-center"    // 上方置中
          autoClose={1000}         // 1 秒後自動關閉
          hideProgressBar={false}  // 顯示進度條（可改成 true）
          newestOnTop
          closeOnClick
          pauseOnHover={false}
          draggable
          limit={1}                // 同時間只顯示 1 則
          theme="light"          // 主題（light、dark 或 colored）
          style={{ zIndex: 9999 }} // 確保在最上層
        />
      </div>
    </Router>
  );
}
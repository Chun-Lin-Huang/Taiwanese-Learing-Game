// App.tsx
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";

// 遊戲區
import Home from "./view/Home";
import ScoreDisplay from "./view/ScoreDisplay";
import LearningMode from "./view/LearningMode";
import GameQuestion from "./view/GameQuestion";
import GameMain from "./view/GameMain";
import GameSelection2 from "./view/GameSelection2";

// 小琳區
import StoryModePage from "./view/StoryModePage";
import ThemeSelectionPage from "./view/ThemeSelectionPage";
import VocabularyOverview from "./view/VocabularyOverview";
import FavoriteCollectionPage from "./view/FavoriteCollectionPage";
import FlashcardApp from "./view/FlashcardApp";
import LoveStoryPage from "./view/LoveStoryPage";
import StoryDetailPage from "./view/StoryDetailPage";

// 王跌跌區
import InstructionsPage from "./view/InstructionsPage";
import SettingsPage from "./view/SettingsPage";
import ProfileEditPage from "./view/ProfileEditPage";
import ResponsePage from "./view/ResponsePage";

// 登入區
import Login from "./view/Login";
import LoginFailure from "./view/LoginFailure";
import LoginSuccess from "./view/LoginSuccess";
import Register from "./view/Register";
import First from "./view/First";
import Welcome from "./view/Welcome";

// 大富翁區
import CreateRoom from "./view/CreateRoom";
import RoomLobby from "./view/RoomLobby";
import Monopoly from "./view/Monopoly";
import ScoreSummary from "./view/ScoreSummary";

// 字典區
import SearchPage from "./view/SearchPage";

import "./Main.css";
import "./App.css";
import "./style/Game.css";
import "./Login.css";

function AppRoutes() {
  const navigate = useNavigate();

  return (
    <Routes>
      {/* 登入 */}
      <Route path="/" element={<First />} />
      <Route path="/Login" element={<Login />} />
      <Route path="/LoginFailure" element={<LoginFailure />} />
      <Route path="/LoginSuccess" element={<LoginSuccess />} />
      <Route path="/Home" element={<Home />} />
      <Route path="/Register" element={<Register />} />
      <Route path="/Welcome" element={<Welcome />} />

      {/* 小琳區 */}
      <Route path="/ThemeSelection" element={<ThemeSelectionPage />} />
      <Route path="/VocabularyOverview/:categoryId" element={<VocabularyOverview />} />
      <Route path="/Learn" element={<LearningMode />} />
      <Route path="/FlashcardApp" element={<FlashcardApp />} />
      <Route path="/FlashcardApp/:cardId" element={<FlashcardApp />} />
      <Route path="/FavoriteCollection" element={<FavoriteCollectionPage />} />

      <Route
        path="/StoryModePage"
        element={
          <StoryModePage
            onBack={() => navigate(-1)}
            onStoryClick={(story) => {
              navigate(`/story/${story.id}`, { state: { title: story.title } });
            }}
          />
        }
      />
      {/* 故事詳情頁：/story/:storyNameId */}
      <Route path="/story/:storyNameId" element={<StoryDetailPage />} />

      <Route path="/LoveStoryPage" element={<LoveStoryPage />} />

      {/* 王跌跌區 */}
      <Route path="/SettingsPage" element={<SettingsPage />} />
      <Route path="/ResponsePage" element={<ResponsePage />} />
      <Route path="/profileedit" element={<ProfileEditPage />} />
      <Route path="/InstructionsPage" element={<InstructionsPage />} />

      {/* 遊戲相關路由 */}
      <Route path="/GameMain" element={<GameMain />} />
      <Route path="/GameSelection2" element={<GameSelection2 />} />
      <Route path="/GameQuestion" element={<GameQuestion />} />
      <Route path="/ScoreDisplay" element={<ScoreDisplay />} />

      {/* 收藏頁面（別名） */}
      <Route path="/favorites" element={<FavoriteCollectionPage />} />

      {/* 大富翁 */}
      <Route path="/SuperMonopoly" element={<CreateRoom />} />
      <Route path="/lobby" element={<RoomLobby />} />
      <Route path="/game" element={<Monopoly />} />
      <Route path="/Scoresummary" element={<ScoreSummary />} />

      {/* 字典區 */}
      <Route path="/DictionaryPage" element={<SearchPage />} />
    </Routes>
  );
}

export default function App() {
  return (
    <Router>
      <div className="app-container">
        <AppRoutes />

        {/* 全域提示框容器（掛一次即可） */}
        <ToastContainer
          position="top-center"
          autoClose={1000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          pauseOnHover={false}
          draggable
          limit={1}
          theme="light"
          style={{ zIndex: 9999 }}
        />
      </div>
    </Router>
  );
}
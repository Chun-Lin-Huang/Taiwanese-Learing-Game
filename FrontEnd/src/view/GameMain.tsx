// 遊戲主介面（選好主題 → 取得最新 Game → 暫存 gameId → 進入題目頁）
import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import ButtonClickSound from "../assets/遊戲開始介面音效.wav";
import "../style/Game.css";
import "../Main.css";
import { api } from "../enum/api"; // 你的 enum/api

type GameTheme = {
  title: string;
  img: string;
  path: string;
};

type GameResponse =
  | {
      code: number;
      message: string;
      body?: {
        _id: string;
        name: string;
        categoryId: string;
        questionCount: number;
        // 如果你的後端把 questions 一併帶回，也無妨
        questions?: unknown[];
      };
    }
  | any;

export default function GameMain() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const theme: GameTheme | undefined = state?.theme;

  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  // 音效
  const buttonClickAudio = useRef(new Audio(ButtonClickSound));
  const playButtonClickSound = () => buttonClickAudio.current.play();

  // 若沒有主題（例如直接輸入網址），導回選擇頁
  useEffect(() => {
    if (!theme) {
      navigate("/GameSelection2", { replace: true });
    }
  }, [theme, navigate]);

  const handleStart = async () => {
    if (!theme) return;
    playButtonClickSound();

    const categoryId = localStorage.getItem("gameCategoryId");
    if (!categoryId) {
      alert("找不到主題分類 ID，請回主題頁重新選擇。");
      return;
    }

    setLoading(true);
    try {
      // 先嘗試「latest」路徑；若 404 再改打一般 by-category
      const tryLatest = async (): Promise<GameResponse> => {
        const r = await fetch(`${api.latestGameByCategory}/${categoryId}`);
        if (r.status === 404) throw new Error("latest404");
        const j = await r.json();
        if (!r.ok) throw new Error(j?.message || "取最新遊戲失敗");
        return j;
      };

      const tryByCategory = async (): Promise<GameResponse> => {
        const r = await fetch(`http://127.0.0.1:2083/api/v1/game/by-category/${categoryId}`);
        const j = await r.json();
        if (!r.ok) throw new Error(j?.message || "取遊戲失敗");
        return j;
      };

      let json: GameResponse;
      try {
        json = await tryLatest();
      } catch (e: any) {
        if (e?.message === "latest404") {
          json = await tryByCategory();
        } else {
          throw e;
        }
      }

      const gameId = json?.body?._id;
      if (!gameId) throw new Error("尚無可用的遊戲場次（Game）。");

      // 暫存，給下一頁用
      localStorage.setItem("gameId", gameId);

      navigate("/GameQuestion", { state: { theme } });
    } catch (err: any) {
      console.error(err);
      alert(err?.message || "載入遊戲失敗");
    } finally {
      setLoading(false);
    }
  };

  if (!theme) return null; // 等 useEffect 導回

  return (
    <div className="game-selection-bg">
      <div
        className="main-menu full-screen"
        style={{ backgroundImage: `url(${theme.img})`, backgroundSize: "cover" }}
      >
        <div className="main-menu-overlay">
          <h1 className="main-menu-title">{theme.title.replace(/\n/g, "")}</h1>

          <div className="menu-buttons">
            <button className="start-button" onClick={handleStart} disabled={loading}>
              {loading ? "載入中..." : "開始遊戲"}
            </button>

            <button
              className="exit-button"
              onClick={() => {
                playButtonClickSound();
                setShowExitConfirm(true);
              }}
            >
              退出遊戲
            </button>
          </div>

          {showExitConfirm && (
            <div className="confirm-dialog">
              <div className="confirm-box">
                <p>確定要離開遊戲嗎？</p>
                <div className="confirm-actions">
                  <button
                    onClick={() => {
                      playButtonClickSound();
                      navigate("/GameSelection2");
                    }}
                  >
                    是
                  </button>
                  <button
                    onClick={() => {
                      playButtonClickSound();
                      setShowExitConfirm(false);
                    }}
                  >
                    否
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
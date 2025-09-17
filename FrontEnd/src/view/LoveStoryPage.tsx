import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import backIcon from "../assets/Back.svg";
import favoriteActive from "../assets/red.svg";
import storyFallback from "../assets/story.png";

import "../style/FavoriteCollectionPage.css";
import "../style/GameSelection.css";
import "../App.css";

import { api } from "../enum/api";
import { asyncGet } from "../utils/fetch";
import { toast } from "react-toastify";

/** 內嵌 deleteCompat，避免 DELETE 的相容性問題 */
async function deleteCompat(url: string, body?: any) {
  const resp = await fetch(url, {
    method: "DELETE",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
    mode: "cors",
  });
  const ct = resp.headers.get("content-type") || "";
  if (resp.status === 204 || !ct.includes("application/json")) return { ok: resp.ok };
  return resp.json();
}

type StoryCard = {
  _id: string; // storyNameId
  name: string;
  imageUrl?: string;
  imageFilename?: string;
};

function getUserId(): string | null {
  return (
    localStorage.getItem("userId") ||
    localStorage.getItem("userid") ||
    localStorage.getItem("uid") ||
    null
  );
}

const LoveStoryPage: React.FC = () => {
  const navigate = useNavigate();
  const userId = useMemo(() => getUserId(), []);
  const [loading, setLoading] = useState(false);
  const [list, setList] = useState<StoryCard[]>([]);

  const buildCoverSrc = (id: string) => `${api.storyCover}/${id}?cb=${id}`;

  const loadCollection = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      // GET /api/v1/story-collection/:userId
      const res = await asyncGet(`${api.storyCollectionList}/${encodeURIComponent(userId)}`);
      const body = res?.body ?? res ?? [];
      const normalized: StoryCard[] = (body as any[]).map((it) => ({
        _id: it._id || it.storyNameId,
        name: it.name,
        imageUrl: it.imageUrl,
        imageFilename: it.imageFilename,
      })).filter((x) => !!x._id);
      setList(normalized);
    } catch (e) {
      console.error(e);
      toast.error("無法讀取收藏清單");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCollection();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const handleUnfavorite = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!userId) {
      toast.info("請先登入");
      return;
    }

    const old = list;
    setList((prev) => prev.filter((x) => x._id !== id)); // 樂觀更新
    try {
      // DELETE /api/v1/story-collection/remove  { userId, storyNameId }
      await deleteCompat(api.storyCollectionRemove, { userId, storyNameId: id });
    } catch (err) {
      console.error(err);
      setList(old); // 失敗回滾
      toast.error("移除收藏失敗");
    }
  };

  return (
    <div className="selection-bg">
      <header className="selection-header">
        <button
          type="button"
          className="back-button"
          aria-label="返回"
          onClick={() => navigate(-1)}
        >
          <img src={backIcon} alt="返回" />
        </button>
        <h1 className="header-title">我的收藏集</h1>
      </header>

      <main className="game-selection-main">
        {!userId && (
          <p style={{ textAlign: "center", marginTop: 24 }}>
            找不到使用者資訊，請先登入。
          </p>
        )}

        {userId && loading && <p style={{ textAlign: "center" }}>載入中…</p>}

        {userId && !loading && list.length === 0 && (
          <p style={{ textAlign: "center", opacity: 0.7 }}>
            這裡將顯示你收藏的故事卡。
          </p>
        )}

        {userId && !loading && list.length > 0 && (
          <div className="story-grid">
            {list.map((s) => {
              const cover = s.imageUrl || buildCoverSrc(s._id);
              return (
                <article
                  key={s._id}
                  className="story-card"
                  onClick={() => navigate(`/story/${s._id}`, { state: { title: s.name } })}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ")
                      navigate(`/story/${s._id}`, { state: { title: s.name } });
                  }}
                >
                  <img
                    src={cover}
                    alt="Story cover"
                    className="story-thumbnail"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = storyFallback;
                    }}
                  />
                  <div className="card-divider" />
                  <h2 className="story-title">《{s.name}》</h2>

                  <button
                    className="favorite-button active"
                    onClick={(e) => handleUnfavorite(e, s._id)}
                    aria-label="移除收藏"
                    title="點擊移除收藏"
                  >
                    <img src={favoriteActive} alt="Favorited" />
                  </button>
                </article>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default LoveStoryPage;
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import "../style/StoryModePage.css";
import "../style/ThemeSelectionPage.css";

import storyImage from "../assets/story.png";
import backIcon from "../assets/Back.svg";
import searchIcon from "../assets/search.svg";
import favoriteIcon from "../assets/收藏.png";
import favoriteTabFgActive from "../assets/red.svg";

import { api } from "../enum/api";
import { asyncGet, asyncPost } from "../utils/fetch"; // 這裡仍使用共用的 GET/POST
import { toast } from "react-toastify";

/** 內嵌一個 DELETE 相容工具：支援 body、且能安全處理 204/空回應 */
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

type Story = {
  _id: string;
  name: string;
  imageUrl?: string;
};

type CollectionItem = {
  // 後端可能直接回 _id 即 storyNameId
  _id?: string;
  storyNameId?: string;
  name?: string;
  imageUrl?: string;
};

interface StoryModePageProps {
  onBack: () => void;
  onStoryClick: (story: { id: string; title: string }) => void;
}

/** 只拿 userId；若沒登入會回 null */
function getUserId(): string | null {
  return (
    localStorage.getItem("userId") ||
    localStorage.getItem("userid") ||
    localStorage.getItem("uid") ||
    null
  );
}

const StoryModePage: React.FC<StoryModePageProps> = ({ onBack, onStoryClick }) => {
  const navigate = useNavigate();

  const [searchText, setSearchText] = useState("");
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(false);

  // 伺服器收藏集合（只存 storyNameId）
  const [favSet, setFavSet] = useState<Set<string>>(new Set());
  const userId = useMemo(() => getUserId(), []);

  const buildCoverSrc = (id: string) => `${api.storyCover}/${id}?cb=${id}`;

  // 進頁載入故事清單
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await asyncGet(api.storyNameList);
        if (res?.body && Array.isArray(res.body)) setStories(res.body);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // 讀取使用者收藏（GET /story-collection/:userId）
  useEffect(() => {
    (async () => {
      if (!userId) return;
      try {
        const listRes = await asyncGet(`${api.storyCollectionList}/${encodeURIComponent(userId)}`);
        const list: CollectionItem[] = listRes?.body ?? listRes ?? [];
        const set = new Set<string>();
        for (const it of list) {
          const id = it._id || it.storyNameId;
          if (id) set.add(id);
        }
        setFavSet(set);
      } catch {
        /* 忽略錯誤不影響主流程 */
      }
    })();
  }, [userId]);

  // 搜尋
  useEffect(() => {
    if (!searchText.trim()) {
      (async () => {
        try {
          const res = await asyncGet(api.storyNameList);
          if (res?.body && Array.isArray(res.body)) setStories(res.body);
        } catch {}
      })();
      return;
    }
    const t = setTimeout(async () => {
      try {
        const res = await asyncGet(`${api.storySearch}?keyword=${encodeURIComponent(searchText)}`);
        if (res?.body && Array.isArray(res.body)) setStories(res.body);
        else setStories([]);
      } catch {
        setStories([]);
      }
    }, 400);
    return () => clearTimeout(t);
  }, [searchText]);

  const isFav = (id: string) => favSet.has(id);

  /** 依照你的 API：
   *  新增：POST /api/v1/story-collection/add  { userId, storyNameId }
   *  移除：DELETE /api/v1/story-collection/remove { userId, storyNameId }
   */
  const toggleFavorite = async (e: React.MouseEvent, story: Story) => {
    e.stopPropagation();

    if (!userId) {
      toast.info("請先登入再使用收藏功能");
      return;
    }

    const id = story._id;
    const prev = new Set(favSet);
    const next = new Set(favSet);

    try {
      if (next.has(id)) {
        // 取消收藏
        next.delete(id);
        setFavSet(next); // 樂觀更新
        await deleteCompat(api.storyCollectionRemove, { userId, storyNameId: id });
      } else {
        // 新增收藏
        next.add(id);
        setFavSet(next); // 樂觀更新
        await asyncPost(api.storyCollectionAdd, { userId, storyNameId: id });
      }
    } catch (err) {
      console.error(err);
      setFavSet(prev); // 失敗回滾
      toast.error(next.has(id) ? "加入收藏失敗" : "移除收藏失敗");
    }
  };

  return (
    <div className="story-selection-bg">
      <header className="selection-header">
        <div className="header-left">
          <button
            type="button"
            className="back-button"
            aria-label="Back"
            onClick={() => navigate("/Learn")}
          >
            <img src={backIcon} alt="返回" />
          </button>
          <h1 className="header-title">故事集</h1>
        </div>

        <button
          type="button"
          aria-label="前往收藏集"
          className="favorite-collection-btn"
          onClick={() => navigate("/LoveStoryPage")}
        >
          <img src={favoriteTabFgActive} alt="收藏集圖示" className="favorite-icon" />
          <span className="favorite-text">收藏集</span>
        </button>
      </header>

      <main className="game-selection-main">
        {/* 搜尋列 */}
        <div className="search-container">
          <div className="search-input-wrapper">
            <img src={searchIcon} alt="Search Icon" className="search-icon-new" />
            <input
              type="text"
              className="search-input-new"
              placeholder="揣故事"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>
        </div>

        {/* Hero 圖 */}
        <div className="hero-image-container">
          <img src={storyImage} alt="Hero" className="hero-image" />
        </div>

        {loading && <p style={{ textAlign: "center" }}>載入中...</p>}
        {!loading && stories.length === 0 && <p className="empty-message">找不到相關故事</p>}

        <div className="story-grid">
          {stories.map((story) => {
            const coverSrc = buildCoverSrc(story._id);
            return (
              <article
                key={story._id}
                className="story-card"
                onClick={() => onStoryClick({ id: story._id, title: story.name })}
              >
                <img
                  src={coverSrc}
                  alt="Story cover"
                  className="story-thumbnail"
                  onError={(e) => {
                    const img = e.currentTarget as HTMLImageElement;
                    if (!img.dataset.fallback) {
                      img.src = storyImage;
                      img.dataset.fallback = "1";
                    }
                  }}
                />
                <div className="card-divider" />
                <h2 className="story-title">《{story.name}》</h2>

                <button
                  className={`favorite-button ${isFav(story._id) ? "active" : ""}`}
                  onClick={(ev) => toggleFavorite(ev, story)}
                  aria-label={isFav(story._id) ? "移除收藏" : "加入收藏"}
                  title={isFav(story._id) ? "再次點擊移除收藏" : "點擊加入收藏"}
                >
                  <img
                    src={isFav(story._id) ? favoriteTabFgActive : favoriteIcon}
                    alt={isFav(story._id) ? "Favorited" : "Add to favorites"}
                  />
                </button>
              </article>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default StoryModePage;
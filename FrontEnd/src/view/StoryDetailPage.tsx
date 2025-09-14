// src/view/StoryDetailPage.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import "../style/StoryDetailPage.css";
import "../style/ThemeSelectionPage.css";

import backIcon from "../assets/back.svg";

import { api } from "../enum/api";
import { asyncGet } from "../utils/fetch";

type StoryDetail = {
  _id: string;
  storyNameId: string;
  chinese?: string;
  han?: string;
  imageUrl?: string;
};

type LocationState = { title?: string } | null;

const StoryDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { storyNameId } = useParams<{ storyNameId: string }>();
  const location = useLocation();
  const state = (location.state as LocationState) || null;

  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState<string | null>(null);
  const [story, setStory] = useState<StoryDetail | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const pageTitle = useMemo(() => state?.title ?? "故事", [state]);

  useEffect(() => {
    if (!storyNameId) {
      setErrMsg("缺少故事 ID");
      setLoading(false);
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        setErrMsg(null);

        // 1) 故事內容
        const res = await asyncGet(`${api.storyDetails}/${encodeURIComponent(storyNameId)}`);
        const body: StoryDetail | undefined = res?.body ?? res;
        if (!body || !body._id) throw new Error("找不到故事內容");
        if (!cancelled) setStory(body);

        // 2) 音檔 URL
        try {
          const metaRes = await asyncGet(
            `${api.storyAudioByStoryName}/${encodeURIComponent(storyNameId)}`
          );
          const url: string | undefined = metaRes?.body?.url ?? metaRes?.url;
          if (url && !cancelled) setAudioUrl(url);
        } catch {
          if (!cancelled) setAudioUrl(null);
        }
      } catch (e: any) {
        if (!cancelled) {
          setErrMsg(e?.message || "載入故事失敗");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
        audioRef.current = null;
      }
    };
  }, [storyNameId]);

  const Header = (
    <header className="story-header">
      <button 
        className="back-button" 
        aria-label="Go back" 
        onClick={() => navigate(-1)}
      >
        <img src={backIcon} alt="Back" />
      </button>
      <div className="header-container">
        <h1 className="story-title">{loading ? "載入中…" : `《${pageTitle}》`}</h1>
      </div>
    </header>
  );

  if (loading) {
    return (
      <div className="story-detail-page">
        {Header}
        <main className="story-main">
          <div className="story-image-container" />
          <div className="story-body">
            <p className="story-paragraph">故事內容載入中，請稍候。</p>
          </div>
        </main>
      </div>
    );
  }

  if (errMsg || !story) {
    return (
      <div className="story-detail-page">
        {Header}
        <main className="story-main">
          <div className="story-image-container" />
          <div className="story-body">
            <p className="story-paragraph" style={{ color: "#b00" }}>
              {errMsg || "無法取得故事內容"}
            </p>
          </div>
        </main>
      </div>
    );
  }

  const coverSrc = story.imageUrl;

  return (
    <div className="story-detail-page">
      {Header}

      <main className="story-main">
        <div className="story-image-container">
          <img
            className="story-image"
            src={coverSrc}
            alt="Story cover"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = "none";
            }}
          />
        </div>

        {/* 直接顯示 <audio controls /> */}
        {audioUrl && (
          <audio
            ref={audioRef}
            className="story-audio"
            src={audioUrl}
            controls
            preload="metadata"
          />
        )}

        <div className="story-body">
          {(() => {
            const hanLines = story.han ? story.han.split(/\n+/) : [];
            const zhLines = story.chinese ? story.chinese.split(/\n+/) : [];
            const maxLen = Math.max(hanLines.length, zhLines.length);

            return Array.from({ length: maxLen }).map((_, i) => (
              <React.Fragment key={i}>
                {hanLines[i] && <p className="story-paragraph han-text">{hanLines[i]}</p>}
                {zhLines[i] && (
                  <p className="story-paragraph chinese-text">（{zhLines[i]}）</p>
                )}
              </React.Fragment>
            ));
          })()}

          {!story.han && !story.chinese && (
            <p className="story-paragraph">（此故事目前沒有內文）</p>
          )}
        </div>
      </main>
    </div>
  );
};

export default StoryDetailPage;
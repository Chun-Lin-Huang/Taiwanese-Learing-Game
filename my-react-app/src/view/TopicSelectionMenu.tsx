import React, { useEffect, useMemo, useState } from "react";
import { api } from "../enum/api";
import { asyncGet } from "../utils/fetch";

type TopicFromApi = {
  _id: string;
  name?: string;
  title?: string;
  displayName?: string;
};

export type TopicItem = { id: string; name: string };

interface TopicSelectionMenuProps {
  onTopicClick: (topic: TopicItem) => void;
}

const TopicSelectionMenu: React.FC<TopicSelectionMenuProps> = ({ onTopicClick }) => {
  const [topics, setTopics] = useState<TopicFromApi[]>([]);
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setErrMsg(null);
        const res = await asyncGet(api.chatChooseList);
        const list: TopicFromApi[] = res?.body ?? res ?? [];
        if (!cancelled) setTopics(Array.isArray(list) ? list : []);
      } catch (e: any) {
        if (!cancelled) setErrMsg(e?.message || "主題清單載入失敗");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const normalized: TopicItem[] = useMemo(
    () =>
      topics.map(t => ({
        id: t._id,
        name: (t.displayName || t.name || t.title || "未命名主題").trim(),
      })),
    [topics]
  );

  return (
    <div className="topic-selection-container">
      <h3 className="topic-selection-title">請選擇對話主題</h3>

      {loading && <p style={{ opacity: .7 }}>載入中…</p>}
      {!loading && errMsg && <p style={{ color: "#b00" }}>{errMsg}</p>}
      {!loading && !errMsg && normalized.length === 0 && (
        <p style={{ opacity: .7 }}>目前沒有主題</p>
      )}

      {!loading && !errMsg && normalized.length > 0 && (
        <ul className="topic-list" style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {normalized.map(t => (
            <li
              key={t.id}
              className="topic-item"
              role="button"
              tabIndex={0}
              onClick={() => onTopicClick(t)}
              onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onTopicClick(t)}
              style={{
                cursor: "pointer",
                padding: "12px 16px",
                margin: "8px 0",
                borderRadius: 12,
                background: "#fffbd3",
                boxShadow: "0 2px 8px rgba(0,0,0,.08)",
                fontWeight: 700,
                textAlign: "center",
              }}
            >
              {t.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TopicSelectionMenu;
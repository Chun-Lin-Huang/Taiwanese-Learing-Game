"use strict";
// 不用直接對應到 StoryCollection，這樣設計已經足夠。
// StoryRec 只要儲存推薦故事的 ID（通常是根據 StoryCollection 統計出來的最多人收藏的故事），
// 不需要直接關聯 StoryCollection，只要用 storyIds 對應到 Story 或 StoryName 的 _id 即可。
Object.defineProperty(exports, "__esModule", { value: true });

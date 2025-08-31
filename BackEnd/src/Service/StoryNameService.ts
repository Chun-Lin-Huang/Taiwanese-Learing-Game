// src/Service/StoryNameService.ts
import { StoryNameModel } from "../orm/schemas/storyNameSchemas";
import type { resp } from "../utils/resp";
import type { StoryName } from "../interfaces/StoryName";

export class StoryNameService {
    private baseUrl = process.env.BASE_URL || "http://127.0.0.1:2083";

    private makeImageUrl(id: string) {
        return `${this.baseUrl}/api/v1/story-name/stream/${id}`;
    }

    /** 取得故事清單（可分頁、可關鍵字） */
    async list(params: { keyword?: string; page?: number; limit?: number }):
        Promise<resp<Array<{ _id: string; name: string; imageFilename?: string; imageUrl: string }>>> {
        const out: resp<any> = { code: 200, message: "", body: [] };

        try {
            const { keyword, page = 1, limit = 20 } = params || {};
            const q: any = {};
            if (keyword && keyword.trim()) {
                q.name = { $regex: keyword.trim(), $options: "i" };
            }

            const rows = await StoryNameModel.find(q)
                .select("_id name imageFilename")
                .sort({ createdAt: -1 })
                .skip((Math.max(1, page) - 1) * Math.max(1, limit))
                .limit(Math.max(1, Math.min(100, limit)))
                .lean();

            out.body = rows.map(r => ({
                _id: String(r._id),
                name: r.name,
                imageFilename: r.imageFilename,
                imageUrl: this.makeImageUrl(String(r._id)),
            }));

            out.code = 200;
            out.message = "find success";
            return out;
        } catch {
            out.code = 500;
            out.message = "server error";
            return out;
        }
    }

    /** 取得單筆（封面串流會用到） */
    async findById(id: string): Promise<StoryName | null> {
        return StoryNameModel.findById(id).select("_id name image imageFilename").lean();
    }
}
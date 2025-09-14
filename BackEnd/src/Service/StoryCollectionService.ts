import { StoryCollectionModel } from "../orm/schemas/storyCollectionSchemas";
import { StoryNameModel } from "../orm/schemas/storyNameSchemas";
import type { resp } from "../utils/resp";

export class StoryCollectionService {
  private readonly baseUrl = process.env.BASE_URL || "http://127.0.0.1:2083";

  private makeImageUrl(id: string) {
    return `${this.baseUrl}/api/v1/story-name/stream/${id}`;
  }

  /** 查詢使用者的收藏 */
  async getByUser(userId: string): Promise<resp<any[]>> {
    const col = await StoryCollectionModel.findOne({ user_id: userId }).lean();
    if (!col) return { code: 200, message: "no collection", body: [] };

    const stories = col.storyNames.map((s) => ({
      ...s,
      imageUrl: this.makeImageUrl(String(s._id)),
    }));

    return { code: 200, message: "success", body: stories };
  }

  /** 新增收藏故事 */
  async addStory(userId: string, storyNameId: string): Promise<resp<any>> {
    const storyDoc = await StoryNameModel.findById(storyNameId).lean();
    if (!storyDoc) return { code: 404, message: "story not found", body: null };

    let col = await StoryCollectionModel.findOne({ user_id: userId });

    if (!col) {
      col = new StoryCollectionModel({
        user_id: userId,
        storyNames: [
          {
            _id: storyDoc._id,
            name: storyDoc.name,
            imageFilename: storyDoc.imageFilename,
            imageSize: storyDoc.imageSize,
          },
        ],
      });
    } else {
      const exists = col.storyNames.find(
        (s) => String(s._id) === String(storyDoc._id)
      );
      if (!exists) {
        col.storyNames.push({
          _id: storyDoc._id,
          name: storyDoc.name,
          imageFilename: storyDoc.imageFilename,
          imageSize: storyDoc.imageSize,
        });
      }
    }

    await col.save();
    return { code: 200, message: "added", body: null };
  }

  /** 移除收藏故事 */
  async removeStory(userId: string, storyNameId: string): Promise<resp<any>> {
    const col = await StoryCollectionModel.findOne({ user_id: userId });
    if (!col) return { code: 404, message: "collection not found", body: null };

    col.storyNames = col.storyNames.filter(
      (s) => String(s._id) !== String(storyNameId)
    );
    await col.save();

    return { code: 200, message: "removed", body: null };
  }
}
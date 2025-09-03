// src/Service/VocabularyCategoryService.ts
import { VocabularyCategoryModel } from "../orm/schemas/vocabularyCategorySchemas";
import type { resp } from "../utils/resp";
import type { VocabularyCategories } from "../interfaces/VocabularyCategories";

export class VocabularyCategoryService {
  private readonly baseUrl = process.env.BASE_URL || "http://127.0.0.1:2083";

  private makeImageUrl(id: string) {
    return `${this.baseUrl}/api/v1/vocab-categories/stream/${id}`;
  }

  /** 取得分類清單（可加 keyword） */
  async list(keyword?: string): Promise<
    resp<Array<{ _id: string; name: string; imageUrl: string }>>
  > {
    const q: any = {};
    if (keyword?.trim()) q.name = { $regex: keyword.trim(), $options: "i" };

    const rows = await VocabularyCategoryModel.find(q)
      .select("_id name")
      .sort({ name: 1 })
      .lean();

    const body = rows.map((r) => ({
      _id: String(r._id),
      name: r.name,
      imageUrl: this.makeImageUrl(String(r._id)),
    }));

    return { code: 200, message: "find success", body };
  }

  /** 串流用：取單筆（含 image / imageType / imageSize） */
  async findById(id: string): Promise<
    Pick<VocabularyCategories, "_id" | "imageType" | "imageSize"> & { image: any } | null
  > {
    return VocabularyCategoryModel.findById(id)
      .select("image imageType imageSize") // ← 改這裡
      .lean();
  }
}
import { Blog } from "../models/Blog.model.js";
import { BaseRepository } from "./base.repository.js";
import { buildSearchFilter } from "../utils/queryOptions.js";

class BlogRepository extends BaseRepository {
  constructor() {
    super(Blog);
  }

  findBySlug(slug) {
    return this.findOne({ slug });
  }

  findSlug(slug, excludeId) {
    const filter = excludeId ? { slug, _id: { $ne: excludeId } } : { slug };
    return this.model.exists(filter);
  }

  list(query, options = {}) {
    const filter = {
      ...buildSearchFilter(query.search, ["title", "excerpt", "content", "category", "tags"]),
    };

    if (options.includeUnpublished) {
      if (query.status) filter.status = query.status;
    } else {
      filter.status = "published";
    }
    if (query.category) filter.category = query.category;
    if (query.tag) filter.tags = query.tag.toLowerCase();
    if (query.isFeatured !== undefined) filter.isFeatured = query.isFeatured;

    return this.paginate({
      filter,
      query,
      sortFields: ["title", "category", "status", "isFeatured", "publishedAt", "createdAt", "updatedAt", "sortOrder"],
      defaultSort: "sortOrder -publishedAt -createdAt",
    });
  }
}

export const blogRepository = new BlogRepository();

import { Project } from "../models/Project.model.js";
import { BaseRepository } from "./base.repository.js";
import { buildSearchFilter } from "../utils/queryOptions.js";

class ProjectRepository extends BaseRepository {
  constructor() {
    super(Project);
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
      ...buildSearchFilter(query.search, ["title", "summary", "description", "industry"]),
    };

    if (options.includeUnpublished) {
      if (query.status) filter.status = query.status;
    } else {
      filter.status = "published";
    }
    if (query.industry) filter.industry = query.industry;
    if (query.service) filter.services = query.service;
    if (query.technology) filter.technologies = query.technology;
    if (query.isFeatured !== undefined) filter.isFeatured = query.isFeatured;

    return this.paginate({
      filter,
      query,
      sortFields: ["title", "industry", "status", "isFeatured", "publishedAt", "createdAt", "updatedAt", "sortOrder"],
      defaultSort: "sortOrder -publishedAt -createdAt",
    });
  }
}

export const projectRepository = new ProjectRepository();

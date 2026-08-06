import { FAQ } from "../models/FAQ.model.js";
import { BaseRepository } from "./base.repository.js";
import { buildSearchFilter } from "../utils/queryOptions.js";

class FaqRepository extends BaseRepository {
  constructor() {
    super(FAQ);
  }

  list(query, options = {}) {
    const filter = {
      ...buildSearchFilter(query.search, ["question", "answer", "category"]),
    };

    if (query.category) filter.category = query.category;
    if (options.includeInactive) {
      if (query.isActive !== undefined) filter.isActive = query.isActive;
    } else {
      filter.isActive = true;
    }

    return this.paginate({
      filter,
      query,
      sortFields: ["question", "category", "sortOrder", "order", "isActive", "createdAt", "updatedAt"],
      defaultSort: "sortOrder order createdAt",
    });
  }
}

export const faqRepository = new FaqRepository();

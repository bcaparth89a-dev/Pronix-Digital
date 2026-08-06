import { Service } from "../models/Service.model.js";
import { BaseRepository } from "./base.repository.js";
import { buildSearchFilter } from "../utils/queryOptions.js";

class ServiceRepository extends BaseRepository {
  constructor() {
    super(Service);
  }

  list(query, options = {}) {
    const filter = {
      ...buildSearchFilter(query.search, ["title", "description", "icon"]),
    };

    if (!options.includeInactive) {
      filter.isActive = true;
    } else if (query.isActive !== undefined) {
      filter.isActive = query.isActive;
    }

    return this.paginate({
      filter,
      query,
      sortFields: ["title", "icon", "order", "isActive", "createdAt", "updatedAt"],
      defaultSort: "order createdAt",
    });
  }
}

export const serviceRepository = new ServiceRepository();

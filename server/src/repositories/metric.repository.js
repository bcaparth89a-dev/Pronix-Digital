import { Metric } from "../models/Metric.model.js";
import { BaseRepository } from "./base.repository.js";
import { buildSearchFilter } from "../utils/queryOptions.js";

class MetricRepository extends BaseRepository {
  constructor() {
    super(Metric);
  }

  list(query, options = {}) {
    const filter = {
      ...buildSearchFilter(query.search, ["label", "value"]),
    };

    if (!options.includeInactive) {
      filter.isActive = true;
    } else if (query.isActive !== undefined) {
      filter.isActive = query.isActive;
    }

    return this.paginate({
      filter,
      query,
      sortFields: ["label", "value", "order", "isActive", "createdAt", "updatedAt"],
      defaultSort: "order createdAt",
    });
  }
}

export const metricRepository = new MetricRepository();

import { Contact } from "../models/Contact.model.js";
import { BaseRepository } from "./base.repository.js";
import { buildSearchFilter } from "../utils/queryOptions.js";

class ContactRepository extends BaseRepository {
  constructor() {
    super(Contact);
  }

  list(query) {
    const filter = {
      ...buildSearchFilter(query.search, [
        "name",
        "email",
        "phone",
        "company",
        "serviceInterest",
        "budgetRange",
        "message",
      ]),
    };

    if (query.status) filter.status = query.status;
    if (query.serviceInterest) filter.serviceInterest = query.serviceInterest;
    if (query.budgetRange) filter.budgetRange = query.budgetRange;
    if (query.source) filter.source = query.source;

    if (query.dateFilter) {
      const now = new Date();
      if (query.dateFilter === "today") {
        const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        filter.createdAt = { $gte: start };
      } else if (query.dateFilter === "this-week") {
        const todayCopy = new Date(now);
        const start = new Date(todayCopy.setDate(todayCopy.getDate() - todayCopy.getDay()));
        start.setHours(0, 0, 0, 0);
        filter.createdAt = { $gte: start };
      } else if (query.dateFilter === "this-month") {
        const start = new Date(now.getFullYear(), now.getMonth(), 1);
        filter.createdAt = { $gte: start };
      }
    }

    return this.paginate({
      filter,
      query,
      sortFields: ["name", "email", "company", "status", "source", "createdAt", "updatedAt"],
      defaultSort: "-createdAt",
    });
  }

  async bulkDelete(ids) {
    return this.model.deleteMany({ _id: { $in: ids } });
  }

  async bulkUpdateStatus(ids, status) {
    return this.model.updateMany({ _id: { $in: ids } }, { status });
  }
}

export const contactRepository = new ContactRepository();


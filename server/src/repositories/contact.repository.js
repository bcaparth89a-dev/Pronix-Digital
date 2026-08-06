import { Contact } from "../models/Contact.model.js";
import { BaseRepository } from "./base.repository.js";
import { buildSearchFilter } from "../utils/queryOptions.js";

class ContactRepository extends BaseRepository {
  constructor() {
    super(Contact);
  }

  list(query) {
    const filter = {
      ...buildSearchFilter(query.search, ["name", "email", "company", "message"]),
    };

    if (query.status) filter.status = query.status;
    if (query.serviceInterest) filter.serviceInterest = query.serviceInterest;
    if (query.source) filter.source = query.source;

    return this.paginate({
      filter,
      query,
      sortFields: ["name", "email", "company", "status", "source", "createdAt", "updatedAt"],
      defaultSort: "-createdAt",
    });
  }
}

export const contactRepository = new ContactRepository();


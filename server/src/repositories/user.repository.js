import { User } from "../models/User.model.js";
import { BaseRepository } from "./base.repository.js";
import { buildSearchFilter } from "../utils/queryOptions.js";

class UserRepository extends BaseRepository {
  constructor() {
    super(User);
  }

  findByEmail(email, options = {}) {
    return this.findOne({ email: email.toLowerCase() }, options);
  }

  findByEmailWithPassword(email) {
    return this.model.findOne({ email: email.toLowerCase() }).select("+password").lean();
  }

  list(query) {
    const filter = {
      ...buildSearchFilter(query.search, ["name", "email"]),
    };

    if (query.role) filter.role = query.role;
    if (query.isActive !== undefined) filter.isActive = query.isActive;

    return this.paginate({
      filter,
      query,
      sortFields: ["name", "email", "role", "isActive", "createdAt"],
      defaultSort: "-createdAt",
    });
  }
}

export const userRepository = new UserRepository();

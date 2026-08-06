import { buildPaginationMeta, getPagination, getSort } from "../utils/queryOptions.js";

export class BaseRepository {
  constructor(model) {
    this.model = model;
  }

  create(payload) {
    return this.model.create(payload);
  }

  findById(id, options = {}) {
    return this.model.findById(id).select(options.select || "").lean(options.lean ?? true);
  }

  findOne(filter, options = {}) {
    return this.model.findOne(filter).select(options.select || "").lean(options.lean ?? true);
  }

  updateById(id, payload, options = {}) {
    return this.model
      .findByIdAndUpdate(id, payload, {
        new: true,
        runValidators: true,
        ...options,
      })
      .lean();
  }

  deleteById(id) {
    return this.model.findByIdAndDelete(id).lean();
  }

  async paginate({ filter = {}, query = {}, sortFields = [], defaultSort = "-createdAt", select = "" }) {
    const { page, limit, skip } = getPagination(query);
    const sort = getSort(query, sortFields, defaultSort);

    const [items, total] = await Promise.all([
      this.model.find(filter).select(select).sort(sort).skip(skip).limit(limit).lean(),
      this.model.countDocuments(filter),
    ]);

    return {
      items,
      meta: buildPaginationMeta({ total, page, limit }),
    };
  }
}


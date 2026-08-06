const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 12;
const MAX_LIMIT = 1000;

export function getPagination(query = {}) {
  const page = Math.max(Number(query.page) || DEFAULT_PAGE, 1);
  const limit = Math.min(Math.max(Number(query.limit) || DEFAULT_LIMIT, 1), MAX_LIMIT);
  const skip = (page - 1) * limit;

  return { page, limit, skip };
}

export function getSort(query = {}, allowedFields = [], defaultSort = "-createdAt") {
  const requestedSort = query.sort || defaultSort;
  const fields = requestedSort.split(",").map((field) => field.trim()).filter(Boolean);
  const safeFields = fields.filter((field) => {
    const normalized = field.startsWith("-") ? field.slice(1) : field;
    return allowedFields.includes(normalized);
  });

  return safeFields.length ? safeFields.join(" ") : defaultSort;
}

export function buildSearchFilter(search, fields = []) {
  if (!search || !fields.length) {
    return {};
  }

  const expression = new RegExp(search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");

  return {
    $or: fields.map((field) => ({ [field]: expression })),
  };
}

export function buildPaginationMeta({ total, page, limit }) {
  const totalPages = Math.ceil(total / limit) || 1;

  return {
    total,
    page,
    limit,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
}


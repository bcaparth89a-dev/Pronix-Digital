import { httpStatus } from "../constants/httpStatus.js";
import { ApiError } from "../utils/ApiError.js";
import { slugify } from "../utils/slugify.js";

export async function createUniqueSlug({ value, providedSlug, exists }) {
  const baseSlug = slugify(providedSlug || value);

  if (!baseSlug) {
    throw new ApiError(httpStatus.UNPROCESSABLE_ENTITY, "Unable to generate a valid slug");
  }

  let slug = baseSlug;
  let suffix = 1;

  while (await exists(slug)) {
    slug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }

  return slug;
}

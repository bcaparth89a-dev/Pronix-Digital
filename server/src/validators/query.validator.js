import { z } from "zod";

const booleanStringSchema = z
  .union([z.boolean(), z.string()])
  .optional()
  .transform((value) => {
    if (value === undefined || value === "") {
      return undefined;
    }

    if (typeof value === "boolean") {
      return value;
    }

    return value === "true";
  });

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(1000).optional(),
  search: z.string().trim().max(120).optional(),
  sort: z.string().trim().max(120).optional(),
});

export const publishedStatusSchema = z.enum(["draft", "published", "archived"]);

export { booleanStringSchema };


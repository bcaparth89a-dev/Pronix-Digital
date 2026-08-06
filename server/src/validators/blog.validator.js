import { z } from "zod";
import { mongoIdSchema } from "./common.validator.js";
import {
  booleanStringSchema,
  paginationQuerySchema,
  publishedStatusSchema,
} from "./query.validator.js";

const imageSchema = z.object({
  url: z.string().url(),
  publicId: z.string().trim().optional(),
  alt: z.string().trim().max(160).optional(),
});

const blogPayloadSchema = z.object({
  title: z.string().trim().min(3).max(180),
  slug: z.string().trim().min(3).max(200).optional(),
  excerpt: z.string().trim().min(10).max(320),
  content: z.string().trim().min(50),
  category: z.string().trim().max(120).optional(),
  tags: z.array(z.string().trim().min(1).max(60)).max(20).optional(),
  author: mongoIdSchema.optional(),
  coverImage: imageSchema.optional(),
  status: publishedStatusSchema.optional(),
  isFeatured: z.boolean().optional(),
  publishedAt: z.coerce.date().optional(),
  readingTimeMinutes: z.coerce.number().int().min(1).max(120).optional(),
  seoTitle: z.string().trim().max(160).optional(),
  seoDescription: z.string().trim().max(320).optional(),
});

export const listBlogsSchema = z.object({
  query: paginationQuerySchema.extend({
    status: publishedStatusSchema.optional(),
    category: z.string().trim().max(120).optional(),
    tag: z.string().trim().max(60).optional(),
    isFeatured: booleanStringSchema,
  }),
});

export const blogSlugSchema = z.object({
  params: z.object({
    slug: z.string().trim().min(1).max(200),
  }),
});

export const blogIdSchema = z.object({
  params: z.object({
    id: mongoIdSchema,
  }),
});

export const createBlogSchema = z.object({
  body: blogPayloadSchema,
});

export const updateBlogSchema = z.object({
  params: z.object({
    id: mongoIdSchema,
  }),
  body: blogPayloadSchema.partial().refine((value) => Object.keys(value).length > 0, {
    message: "At least one field is required",
  }),
});

export const reorderSchema = z.object({
  body: z.object({
    orders: z.array(
      z.object({
        id: mongoIdSchema,
        sortOrder: z.number().int(),
      })
    ),
  }),
});

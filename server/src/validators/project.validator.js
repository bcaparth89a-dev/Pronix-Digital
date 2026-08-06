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

const projectPayloadSchema = z.object({
  title: z.string().trim().min(3).max(160),
  slug: z.string().trim().min(3).max(180).optional(),
  summary: z.string().trim().min(10).max(300),
  description: z.string().trim().min(20),
  clientName: z.string().trim().max(120).optional(),
  industry: z.string().trim().max(120).optional(),
  services: z.array(z.string().trim().min(1).max(80)).max(20).optional(),
  technologies: z.array(z.string().trim().min(1).max(80)).max(30).optional(),
  coverImage: imageSchema.optional(),
  gallery: z.array(imageSchema).max(20).optional(),
  projectUrl: z.string().url().optional(),
  seoTitle: z.string().trim().max(160).optional(),
  seoDescription: z.string().trim().max(320).optional(),
  problem: z.string().trim().optional(),
  solution: z.string().trim().optional(),
  results: z.string().trim().optional(),
  githubUrl: z.string().url().optional(),
  status: publishedStatusSchema.optional(),
  isFeatured: z.boolean().optional(),
  publishedAt: z.coerce.date().optional(),
});

export const listProjectsSchema = z.object({
  query: paginationQuerySchema.extend({
    status: publishedStatusSchema.optional(),
    industry: z.string().trim().max(120).optional(),
    service: z.string().trim().max(80).optional(),
    technology: z.string().trim().max(80).optional(),
    isFeatured: booleanStringSchema,
  }),
});

export const projectSlugSchema = z.object({
  params: z.object({
    slug: z.string().trim().min(1).max(180),
  }),
});

export const projectIdSchema = z.object({
  params: z.object({
    id: mongoIdSchema,
  }),
});

export const createProjectSchema = z.object({
  body: projectPayloadSchema,
});

export const updateProjectSchema = z.object({
  params: z.object({
    id: mongoIdSchema,
  }),
  body: projectPayloadSchema.partial().refine((value) => Object.keys(value).length > 0, {
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

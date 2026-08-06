import { z } from "zod";
import { mongoIdSchema } from "./common.validator.js";
import { booleanStringSchema, paginationQuerySchema } from "./query.validator.js";

const faqPayloadSchema = z.object({
  question: z.string().trim().min(5).max(240),
  answer: z.string().trim().min(5),
  category: z.string().trim().max(120).optional(),
  order: z.coerce.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
});

export const listFaqsSchema = z.object({
  query: paginationQuerySchema.extend({
    category: z.string().trim().max(120).optional(),
    isActive: booleanStringSchema,
  }),
});

export const faqIdSchema = z.object({
  params: z.object({
    id: mongoIdSchema,
  }),
});

export const createFaqSchema = z.object({
  body: faqPayloadSchema,
});

export const updateFaqSchema = z.object({
  params: z.object({
    id: mongoIdSchema,
  }),
  body: faqPayloadSchema.partial().refine((value) => Object.keys(value).length > 0, {
    message: "At least one field is required",
  }),
});

export const reorderFaqsSchema = z.object({
  body: z.object({
    orders: z.array(
      z.object({
        id: mongoIdSchema,
        sortOrder: z.number().int(),
      })
    ),
  }),
});


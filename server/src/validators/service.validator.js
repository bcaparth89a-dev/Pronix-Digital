import { z } from "zod";
import { mongoIdSchema } from "./common.validator.js";
import { booleanStringSchema, paginationQuerySchema } from "./query.validator.js";

const servicePayloadSchema = z.object({
  icon: z.string().trim().min(1).max(80),
  title: z.string().trim().min(2).max(120),
  description: z.string().trim().min(5),
  longDescription: z.string().trim().optional(),
  order: z.coerce.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
});

export const listServicesSchema = z.object({
  query: paginationQuerySchema.extend({
    isActive: booleanStringSchema,
  }),
});

export const serviceIdSchema = z.object({
  params: z.object({
    id: mongoIdSchema,
  }),
});

export const createServiceSchema = z.object({
  body: servicePayloadSchema,
});

export const updateServiceSchema = z.object({
  params: z.object({
    id: mongoIdSchema,
  }),
  body: servicePayloadSchema.partial().refine((value) => Object.keys(value).length > 0, {
    message: "At least one field is required",
  }),
});

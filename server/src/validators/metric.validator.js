import { z } from "zod";
import { mongoIdSchema } from "./common.validator.js";
import { booleanStringSchema, paginationQuerySchema } from "./query.validator.js";

const metricPayloadSchema = z.object({
  label: z.string().trim().min(2).max(120),
  value: z.string().trim().min(1).max(60),
  order: z.coerce.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
});

export const listMetricsSchema = z.object({
  query: paginationQuerySchema.extend({
    isActive: booleanStringSchema,
  }),
});

export const metricIdSchema = z.object({
  params: z.object({
    id: mongoIdSchema,
  }),
});

export const createMetricSchema = z.object({
  body: metricPayloadSchema,
});

export const updateMetricSchema = z.object({
  params: z.object({
    id: mongoIdSchema,
  }),
  body: metricPayloadSchema.partial().refine((value) => Object.keys(value).length > 0, {
    message: "At least one field is required",
  }),
});

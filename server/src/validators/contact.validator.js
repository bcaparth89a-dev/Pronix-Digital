import { z } from "zod";
import { mongoIdSchema } from "./common.validator.js";
import { paginationQuerySchema } from "./query.validator.js";

const contactStatusSchema = z.enum(["new", "contacted", "in-progress", "closed", "spam"]);

const contactPayloadSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(180),
  phone: z.string().trim().max(30).optional().nullable(),
  company: z.string().trim().max(140).optional().nullable(),
  serviceInterest: z.string().trim().max(120).optional().nullable(),
  budgetRange: z.string().trim().max(80).optional().nullable(),
  message: z.string().trim().min(10).max(5000),
  source: z.string().trim().max(80).optional().nullable(),
});

export const listContactsSchema = z.object({
  query: paginationQuerySchema.extend({
    status: contactStatusSchema.optional(),
    serviceInterest: z.string().trim().max(120).optional(),
    budgetRange: z.string().trim().max(120).optional(),
    dateFilter: z.enum(["today", "this-week", "this-month"]).optional(),
    source: z.string().trim().max(80).optional(),
    search: z.string().trim().optional(),
    sort: z.string().trim().optional(),
  }),
});

export const contactIdSchema = z.object({
  params: z.object({
    id: mongoIdSchema,
  }),
});

export const createContactSchema = z.object({
  body: contactPayloadSchema,
});

export const updateContactStatusSchema = z.object({
  params: z.object({
    id: mongoIdSchema,
  }),
  body: z.object({
    status: contactStatusSchema,
  }),
});

export const updateContactNotesSchema = z.object({
  params: z.object({
    id: mongoIdSchema,
  }),
  body: z.object({
    notes: z.string().max(10000).default(""),
  }),
});

export const bulkDeleteSchema = z.object({
  body: z.object({
    ids: z.array(mongoIdSchema).min(1),
  }),
});

export const bulkUpdateStatusSchema = z.object({
  body: z.object({
    ids: z.array(mongoIdSchema).min(1),
    status: contactStatusSchema,
  }),
});


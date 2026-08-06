import { z } from "zod";
import { mongoIdSchema } from "./common.validator.js";
import { paginationQuerySchema } from "./query.validator.js";

const contactStatusSchema = z.enum(["new", "in-review", "contacted", "qualified", "closed", "spam"]);

const contactPayloadSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(180),
  phone: z.string().trim().max(30).optional(),
  company: z.string().trim().max(140).optional(),
  serviceInterest: z.string().trim().max(120).optional(),
  budgetRange: z.string().trim().max(80).optional(),
  message: z.string().trim().min(10).max(5000),
  source: z.string().trim().max(80).optional(),
});

export const listContactsSchema = z.object({
  query: paginationQuerySchema.extend({
    status: contactStatusSchema.optional(),
    serviceInterest: z.string().trim().max(120).optional(),
    source: z.string().trim().max(80).optional(),
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


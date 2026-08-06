import { z } from "zod";
import { mongoIdSchema } from "./common.validator.js";
import { booleanStringSchema, paginationQuerySchema } from "./query.validator.js";

export const userIdSchema = z.object({
  params: z.object({
    id: mongoIdSchema,
  }),
});

export const createUserSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(120),
    email: z.string().trim().email().max(180),
    password: z.string().min(8).max(128),
    role: z.enum(["admin", "user"]).optional(),
    isActive: z.boolean().optional(),
  }),
});

export const listUsersSchema = z.object({
  query: paginationQuerySchema.extend({
    role: z.enum(["admin", "user"]).optional(),
    isActive: booleanStringSchema,
  }),
});

export const updateUserSchema = z.object({
  params: z.object({
    id: mongoIdSchema,
  }),
  body: z
    .object({
      name: z.string().trim().min(2).max(120).optional(),
      role: z.enum(["admin", "user"]).optional(),
      isActive: z.boolean().optional(),
    })
    .refine((value) => Object.keys(value).length > 0, {
      message: "At least one field is required",
    }),
});

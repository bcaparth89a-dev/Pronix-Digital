import { z } from "zod";

export const adminLoginSchema = z.object({
  body: z.object({
    email: z.string().trim().email().max(180),
    password: z.string().min(8).max(128),
  }),
});


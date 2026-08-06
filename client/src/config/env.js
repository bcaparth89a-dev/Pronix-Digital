import { z } from "zod";

const envSchema = z.object({
  VITE_APP_NAME: z.string().default("Pronix Digital"),
  VITE_SITE_URL: z.string().url().default("https://pronixdigital.tech"),
  VITE_API_BASE_URL: z.string(),
  VITE_ENABLE_REACT_QUERY_DEVTOOLS: z
    .string()
    .default("false")
    .transform((value) => value === "true"),
});

const parsedEnv = envSchema.safeParse(import.meta.env);

if (!parsedEnv.success) {
  console.error("Invalid client environment variables", parsedEnv.error.flatten().fieldErrors);
  throw new Error("Invalid client environment variables");
}

export const env = parsedEnv.data;

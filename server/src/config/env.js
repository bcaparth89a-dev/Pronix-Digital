import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(5001),
  CLIENT_URL: z.string().default("https://pronix-digital.vercel.app"),
  SITE_URL: z.string().default("https://pronix-digital.vercel.app"),
  API_PREFIX: z.string().startsWith("/").default("/api/v1"),
  MONGODB_URI: z.string().min(1),
  JWT_ACCESS_SECRET: z.string().min(8).default("replace-with-a-long-random-access-secret-32-chars"),
  JWT_REFRESH_SECRET: z.string().min(8).default("replace-with-a-long-random-refresh-secret-32-chars"),
  JWT_ACCESS_EXPIRES_IN: z.string().default("15m"),
  JWT_REFRESH_EXPIRES_IN: z.string().default("7d"),
  REFRESH_TOKEN_COOKIE_NAME: z.string().default("pronix_refresh_token"),
  BCRYPT_SALT_ROUNDS: z.coerce.number().int().min(10).max(15).default(12),
  EMAIL_SERVICE: z.string().optional().default(""),
  EMAIL_USER: z.string().optional().default(""),
  EMAIL_PASS: z.string().optional().default(""),
  MAIL_FROM: z.string().optional().default(""),
  ADMIN_NOTIFY_EMAILS: z.string().optional().default(""),
  RESEND_API_KEY: z.string().optional().default(""),
  SMTP_HOST: z.string().optional().default(""),
  SMTP_PORT: z.coerce.number().int().optional().default(587),
  SMTP_SECURE: z.string().optional().default("false"),
  CLOUDINARY_CLOUD_NAME: z.string().optional().default(""),
  CLOUDINARY_API_KEY: z.string().optional().default(""),
  CLOUDINARY_API_SECRET: z.string().optional().default(""),
  GEMINI_API_KEY: z.string().optional().default(""),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error("CRITICAL CONFIG ERROR: Invalid environment variables:", JSON.stringify(parsedEnv.error.flatten().fieldErrors));
}

export const env = parsedEnv.success ? parsedEnv.data : {
  NODE_ENV: process.env.NODE_ENV || "production",
  PORT: Number(process.env.PORT) || 5001,
  CLIENT_URL: process.env.CLIENT_URL || "https://pronix-digital.vercel.app",
  SITE_URL: process.env.SITE_URL || "https://pronix-digital.vercel.app",
  API_PREFIX: "/api/v1",
  MONGODB_URI: process.env.MONGODB_URI || "",
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || "replace-with-a-long-random-access-secret-32-chars",
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || "replace-with-a-long-random-refresh-secret-32-chars",
  JWT_ACCESS_EXPIRES_IN: "15m",
  JWT_REFRESH_EXPIRES_IN: "7d",
  REFRESH_TOKEN_COOKIE_NAME: "pronix_refresh_token",
  BCRYPT_SALT_ROUNDS: 12,
  EMAIL_SERVICE: process.env.EMAIL_SERVICE || "",
  EMAIL_USER: process.env.EMAIL_USER || "",
  EMAIL_PASS: process.env.EMAIL_PASS || "",
  MAIL_FROM: process.env.MAIL_FROM || "",
  ADMIN_NOTIFY_EMAILS: process.env.ADMIN_NOTIFY_EMAILS || "",
  RESEND_API_KEY: process.env.RESEND_API_KEY || "",
  SMTP_HOST: process.env.SMTP_HOST || "",
  SMTP_PORT: Number(process.env.SMTP_PORT) || 587,
  SMTP_SECURE: process.env.SMTP_SECURE || "false",
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || "",
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || "",
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || "",
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || "",
};

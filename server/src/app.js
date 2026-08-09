import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import { env } from "./config/env.js";
import { rateLimiter } from "./config/rateLimiter.js";
import { seoRouter } from "./routes/seo.routes.js";
import { apiRouter } from "./api/v1/index.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { notFoundHandler } from "./middlewares/notFoundHandler.js";
import { mongoSanitize, xssClean, permissionsPolicy } from "./middlewares/security.middleware.js";

import mongoose from "mongoose";
import { connectDatabase } from "./db/mongoose.js";

export const app = express();

app.set("trust proxy", 1);

// Auto-connect database in serverless contexts
app.use(async (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    try {
      await connectDatabase();
    } catch (err) {
      console.error("Serverless DB connection error:", err);
    }
  }
  next();
});

app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        "default-src": ["'self'"],
        "script-src": ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://apis.google.com"],
        "style-src": ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        "font-src": ["'self'", "https://fonts.gstatic.com"],
        "img-src": ["'self'", "data:", "https://res.cloudinary.com", "https://images.unsplash.com"],
        "connect-src": [
          "'self'",
          "https://res.cloudinary.com",
          "https://api.openai.com",
          "https://generativelanguage.googleapis.com",
        ],
        "frame-src": ["'self'"],
        "object-src": ["'none'"],
        "upgrade-insecure-requests": [],
      },
    },
    crossOriginOpenerPolicy: { policy: "same-origin" },
    crossOriginResourcePolicy: { policy: "cross-origin" },
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
    frameguard: { action: "deny" },
  }),
);
app.use(compression());
app.use(permissionsPolicy);
const allowedOrigins = new Set([
  "https://pronixdigital.tech",
  "https://www.pronixdigital.tech",
  "https://pronix-digital-client-de19.vercel.app",
  "http://localhost:3000",
  "http://localhost:5173",
  "http://localhost:4173",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:4173",
]);

if (env.CLIENT_URL) allowedOrigins.add(env.CLIENT_URL);
if (env.SITE_URL) allowedOrigins.add(env.SITE_URL);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, postman, etc.)
      if (!origin) {
        return callback(null, true);
      }

      if (
        allowedOrigins.has(origin) ||
        /^https:\/\/pronix-digital-client-[a-zA-Z0-9-]+\.vercel\.app$/.test(origin)
      ) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    maxAge: 86400,
  }),
);
app.use(rateLimiter);
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(cookieParser());
app.use(mongoSanitize);
app.use(xssClean);

if (env.NODE_ENV !== "test") {
  app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));
}

app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    service: "pronix-api",
  });
});

app.use(seoRouter);
app.use(env.API_PREFIX, apiRouter);
app.use(notFoundHandler);
app.use(errorHandler);

export default app;

import rateLimit from "express-rate-limit";

// Global limiter: 300 requests / 15m
export const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  skip: (req) => {
    return req.originalUrl && req.originalUrl.includes("/chat/config");
  },
  message: {
    status: 429,
    message: "Too many requests from this IP. Please try again later.",
  },
});

// Authentication rate limiter: 5 attempts / 15m
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    status: 429,
    message: "Too many login attempts. Please try again after 15 minutes.",
  },
});

// Contact submission rate limiter: 5 messages / hour
export const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  limit: 5,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    status: 429,
    message: "Too many contact submissions. Please try again in an hour.",
  },
});

// Chat / AI rate limiter: 15 queries / 15m
export const chatLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 15,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    status: 429,
    message: "Too many chat queries. Please wait a moment and try again.",
  },
});

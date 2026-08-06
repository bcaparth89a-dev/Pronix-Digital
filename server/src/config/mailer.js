import nodemailer from "nodemailer";
import { env } from "./env.js";
import { logger } from "../utils/logger.js";

logger.info("Creating SMTP transporter...");

// Print configurations for verification (without leaking password characters)
logger.info(`EMAIL_USER loaded: ${env.EMAIL_USER ? env.EMAIL_USER : "Not Configured"}`);
logger.info(`EMAIL_PASS loaded: ${env.EMAIL_PASS ? `[Configured (Length: ${env.EMAIL_PASS.length} characters)]` : "Not Configured"}`);
logger.info(`EMAIL_SERVICE loaded: ${env.EMAIL_SERVICE ? env.EMAIL_SERVICE : "Not Configured"}`);
logger.info(`MAIL_FROM loaded: ${env.MAIL_FROM ? env.MAIL_FROM : "Not Configured"}`);

const isGmail = env.EMAIL_SERVICE === "gmail" || (env.EMAIL_USER && env.EMAIL_USER.endsWith("@gmail.com"));

const transportConfig = {
  host: isGmail ? "smtp.gmail.com" : (env.SMTP_HOST || "smtp.gmail.com"),
  port: isGmail ? 587 : (Number(env.SMTP_PORT) || 587),
  secure: isGmail ? false : (env.SMTP_SECURE === "true"),
  auth: {
    user: env.EMAIL_USER,
    pass: env.EMAIL_PASS,
  },
  // Force IPv4 resolution to prevent connect ENETUNREACH on Render's network
  family: 4,
  // Timeouts to prevent hanging sockets
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 15000,
};

logger.info("SMTP configuration loaded.");

let transport = null;

if (env.EMAIL_USER && env.EMAIL_PASS) {
  transport = nodemailer.createTransport(transportConfig);
  logger.info("Verifying SMTP connection...");
  
  transport.verify((error) => {
    if (error) {
      if (error.code === "EAUTH") {
        logger.error("SMTP authentication failed.");
      } else {
        logger.error(`SMTP connection failed. Error: ${error.message}`);
      }
    } else {
      logger.info("SMTP verified successfully.");
    }
  });
} else {
  logger.warn("SMTP connection failed. Reason: Credentials not provided.");
}

export const mailer = transport;
import nodemailer from "nodemailer";
import { env } from "./env.js";
import { logger } from "../utils/logger.js";

let transport = null;

if (env.EMAIL_USER && env.EMAIL_PASS) {
  const isGmail = env.EMAIL_SERVICE === "gmail" || env.EMAIL_USER.endsWith("@gmail.com");

  const transportConfig = {
    auth: {
      user: env.EMAIL_USER,
      pass: env.EMAIL_PASS,
    },
    // Force IPv4 DNS resolution to prevent ENETUNREACH on Render's network
    family: 4,
    // Connect timeout in ms
    connectionTimeout: 10000,
    // Greeting timeout in ms
    greetingTimeout: 10000,
  };

  if (isGmail) {
    // Explicit configuration for Gmail SMTP (avoiding "service: 'gmail'")
    transportConfig.host = "smtp.gmail.com";
    transportConfig.port = 587;
    transportConfig.secure = false;
    transportConfig.requireTLS = true;
  } else {
    // Standard custom SMTP configurations
    transportConfig.host = env.SMTP_HOST || "smtp.gmail.com";
    transportConfig.port = Number(env.SMTP_PORT) || 587;
    transportConfig.secure = env.SMTP_SECURE === "true";
  }

  transport = nodemailer.createTransport(transportConfig);

  logger.info(`SMTP Mailer initialized using host ${transportConfig.host}:${transportConfig.port}`);
  
  transport.verify((error) => {
    if (error) {
      if (error.code === "ENETUNREACH") {
        logger.error("SMTP Connection Failed: Network unreachable (IPv6 connection issue). Set family: 4 or migrate to HTTP API (Resend).");
      } else if (error.code === "ETIMEDOUT") {
        logger.error("SMTP Connection Failed: Connection timeout. Check firewall outbound rules or port blocking.");
      } else if (error.code === "EAUTH") {
        logger.error("SMTP Authentication Failed: Invalid App Password or credentials.");
      } else {
        logger.error(`SMTP Connection Failed: ${error.message}`);
      }
    } else {
      logger.info("SMTP Authentication Successful. SMTP Server is Ready.");
    }
  });
} else {
  logger.info("SMTP Mailer credentials not provided. Mailer is inactive.");
}

export const mailer = transport;
import nodemailer from "nodemailer";
import dns from "dns";
import { env } from "./env.js";
import { logger } from "../utils/logger.js";

logger.info("Creating SMTP transporter...");

// Print configurations for verification (without leaking password credentials)
logger.info(`EMAIL_USER loaded: ${env.EMAIL_USER ? env.EMAIL_USER : "Not Configured"}`);
logger.info(`EMAIL_PASS loaded: ${env.EMAIL_PASS ? "Configured" : "Not Configured"}`);
logger.info(`EMAIL_SERVICE loaded: ${env.EMAIL_SERVICE ? env.EMAIL_SERVICE : "Not Configured"}`);
logger.info(`MAIL_FROM loaded: ${env.MAIL_FROM ? env.MAIL_FROM : "Not Configured"}`);

const isGmail = env.EMAIL_SERVICE === "gmail" || (env.EMAIL_USER && env.EMAIL_USER.endsWith("@gmail.com"));
const smtpHost = isGmail ? "smtp.gmail.com" : (env.SMTP_HOST || "smtp.gmail.com");
const smtpPort = isGmail ? 587 : (Number(env.SMTP_PORT) || 587);
const smtpSecure = isGmail ? false : (env.SMTP_SECURE === "true");

// Force Node's default DNS result order to prioritize IPv4 addresses
if (typeof dns.setDefaultResultOrder === "function") {
  dns.setDefaultResultOrder("ipv4first");
}

export let mailer = null;

if (env.EMAIL_USER && env.EMAIL_PASS) {
  logger.info(`[Diagnostics] Performing DNS lookup for SMTP host: ${smtpHost}...`);

  // Resolve IPv4 directly to bypass any OS / container DNS level IPv6 resolution
  dns.lookup(smtpHost, { family: 4 }, (dnsErr, address) => {
    if (dnsErr) {
      logger.error(`[Diagnostics] DNS lookup failed for ${smtpHost}: ${dnsErr.message}`);
      logger.error("SMTP connection failed.");
      return;
    }

    logger.info(`Connecting to:\n${address}\nFamily: IPv4`);
    logger.info("SMTP configuration loaded.");

    const transportConfig = {
      host: address, // Direct IPv4 IP address to bypass client resolution entirely
      port: smtpPort,
      secure: smtpSecure,
      auth: {
        user: env.EMAIL_USER,
        pass: env.EMAIL_PASS,
      },
      // Root servername overrides STARTTLS host parsing
      servername: smtpHost,
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 15000,
      tls: {
        servername: smtpHost, // Crucial for TLS certificate match validation
        rejectUnauthorized: true,
      },
    };

    try {
      mailer = nodemailer.createTransport(transportConfig);
      logger.info("Verifying SMTP connection...");

      mailer.verify((error) => {
        if (error) {
          logger.error(`[Diagnostics] SMTP verify error: Code=${error.code}, Message=${error.message}`);
          if (error.code === "EAUTH") {
            logger.error("SMTP authentication failed.");
          } else {
            logger.error("SMTP connection failed.");
          }
        } else {
          logger.info("SMTP verified successfully.");
        }
      });
    } catch (createErr) {
      logger.error(`[SMTP] Transporter creation failed: ${createErr.message}`);
      logger.error("SMTP connection failed.");
    }
  });
} else {
  logger.warn("SMTP connection failed. Reason: Credentials not provided.");
}
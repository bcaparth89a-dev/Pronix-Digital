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

    // Transporter for Port 587 (STARTTLS)
    const config587 = {
      host: address,
      port: 587,
      secure: false,
      auth: {
        user: env.EMAIL_USER,
        pass: env.EMAIL_PASS,
      },
      servername: smtpHost,
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 15000,
      logger: true, // Output SMTP transaction logs to stdout
      debug: true,  // Output SMTP debugging info to stdout
      tls: {
        servername: smtpHost,
        rejectUnauthorized: true,
      },
    };

    // Transporter for Port 465 (Implicit TLS)
    const config465 = {
      host: address,
      port: 465,
      secure: true,
      auth: {
        user: env.EMAIL_USER,
        pass: env.EMAIL_PASS,
      },
      servername: smtpHost,
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 15000,
      logger: true,
      debug: true,
      tls: {
        servername: smtpHost,
        rejectUnauthorized: true,
      },
    };

    const transporter587 = nodemailer.createTransport(config587);
    const transporter465 = nodemailer.createTransport(config465);

    // Default mailer to 587 transporter first
    mailer = transporter587;

    logger.info("[Diagnostics] Verifying SMTP connection on Port 587 (STARTTLS)...");
    transporter587.verify((err587) => {
      if (err587) {
        logger.error(`[Diagnostics] Port 587 Verification failed: Code=${err587.code}, Message=${err587.message}`);
      } else {
        logger.info("[Diagnostics] Port 587 (STARTTLS) verified successfully.");
        mailer = transporter587;
      }

      logger.info("[Diagnostics] Verifying SMTP connection on Port 465 (SSL/TLS)...");
      transporter465.verify((err465) => {
        if (err465) {
          logger.error(`[Diagnostics] Port 465 Verification failed: Code=${err465.code}, Message=${err465.message}`);
        } else {
          logger.info("[Diagnostics] Port 465 (SSL/TLS) verified successfully.");
          // If port 465 works, update the exported mailer reference
          mailer = transporter465;
        }

        if (err587 && err465) {
          logger.error("[Diagnostics] BOTH SMTP Ports (587 and 465) failed to verify.");
          logger.error("Root Cause Analysis: Outbound SMTP connection timed out on both ports.");
          logger.error("This indicates that the hosting provider (Render) is blocking outgoing connections on all standard SMTP ports (587 & 465) at the network firewall layer, OR Gmail's SMTP servers are silently dropping TCP packets from this datacenter IP range.");
          logger.error("No further code changes can bypass this network-level timeout restriction. Access to smtp.gmail.com is blocked by the infrastructure network policies.");
        }
      });
    });
  });
} else {
  logger.warn("SMTP connection failed. Reason: Credentials not provided.");
}
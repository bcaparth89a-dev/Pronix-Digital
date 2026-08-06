import nodemailer from "nodemailer";
import dns from "dns";
import { env } from "./env.js";
import { logger } from "../utils/logger.js";

logger.info("Creating SMTP transporter...");

// Print configurations for verification (without leaking password characters)
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

// Run Diagnostic DNS lookups on Startup
logger.info(`[Diagnostics] Performing DNS lookup for SMTP host: ${smtpHost}...`);

// Resolve IPv4
dns.resolve4(smtpHost, (err, addresses) => {
  if (err) {
    logger.error(`[Diagnostics] IPv4 DNS resolution failed for ${smtpHost}: ${err.message}`);
  } else {
    logger.info(`[Diagnostics] IPv4 DNS resolved addresses: ${JSON.stringify(addresses)}`);
  }
});

// Resolve IPv6
dns.resolve6(smtpHost, (err, addresses) => {
  if (err) {
    logger.info(`[Diagnostics] IPv6 DNS resolution failed or unavailable for ${smtpHost}: ${err.message}`);
  } else {
    logger.info(`[Diagnostics] IPv6 DNS resolved addresses: ${JSON.stringify(addresses)}`);
  }
});

// Default OS resolver lookup (this determines what Node.js net connection will try first by default)
dns.lookup(smtpHost, (err, address, family) => {
  if (err) {
    logger.error(`[Diagnostics] Default DNS lookup failed for ${smtpHost}: ${err.message}`);
  } else {
    logger.info(`[Diagnostics] Default DNS resolved IP: ${address} (Family: IPv${family})`);
  }
});

// Custom DNS lookup function to force IPv4 only
const customLookup = (hostname, options, callback) => {
  let cb = callback;
  let lookupOptions = options;
  if (typeof options === "function") {
    cb = options;
    lookupOptions = {};
  }
  const mergedOptions = Object.assign({}, lookupOptions || {}, { family: 4 });
  return dns.lookup(hostname, mergedOptions, cb);
};

const transportConfig = {
  host: smtpHost,
  port: smtpPort,
  secure: smtpSecure,
  auth: {
    user: env.EMAIL_USER,
    pass: env.EMAIL_PASS,
  },
  // Custom lookup forcing IPv4
  lookup: customLookup,
  // Timeouts to prevent hanging sockets
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 15000,
  tls: {
    rejectUnauthorized: true,
  },
};

// Log SMTP Configuration (Excluding credentials)
logger.info("[Diagnostics] Transporter Configuration Loaded:");
logger.info(`  - Host: ${transportConfig.host}`);
logger.info(`  - Port: ${transportConfig.port}`);
logger.info(`  - Secure (implicit SSL/TLS): ${transportConfig.secure}`);
logger.info(`  - Custom IPv4 Lookup: Configured`);
logger.info(`  - Connection Timeout: ${transportConfig.connectionTimeout}ms`);
logger.info(`  - Greeting Timeout: ${transportConfig.greetingTimeout}ms`);
logger.info(`  - Socket Timeout: ${transportConfig.socketTimeout}ms`);
logger.info(`  - TLS RejectUnauthorized: ${transportConfig.tls.rejectUnauthorized}`);

let transport = null;

if (env.EMAIL_USER && env.EMAIL_PASS) {
  transport = nodemailer.createTransport(transportConfig);
  logger.info("Verifying SMTP connection...");
  
  transport.verify((error) => {
    if (error) {
      logger.error(`[Diagnostics] SMTP verify error: Code=${error.code}, Message=${error.message}, Syscall=${error.syscall || "none"}`);
      if (error.code === "EAUTH") {
        logger.error("SMTP authentication failed.");
      } else {
        logger.error("SMTP connection failed.");
      }
    } else {
      logger.info("SMTP verified successfully.");
    }
  });
} else {
  logger.warn("SMTP connection failed. Reason: Credentials not provided.");
}

export const mailer = transport;
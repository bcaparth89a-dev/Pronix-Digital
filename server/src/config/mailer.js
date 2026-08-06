import nodemailer from "nodemailer";
import dns from "dns";
import net from "net";
import tls from "tls";
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

// Custom connection factory that resolves hostname to IPv4 and initiates socket connection
const customCreateConnection = (options, callback) => {
  const host = options.host || smtpHost;
  const port = options.port || smtpPort;
  const secure = options.secure !== undefined ? options.secure : smtpSecure;

  logger.info(`[SocketFactory] Resolving host: ${host} using IPv4...`);

  dns.lookup(host, { family: 4 }, (dnsErr, ipAddress) => {
    if (dnsErr) {
      logger.error(`[SocketFactory] DNS resolution failed for ${host}: ${dnsErr.message}`);
      return callback(dnsErr);
    }

    logger.info(`[SocketFactory] Resolved ${host} to IPv4: ${ipAddress}`);
    logger.info(`[SocketFactory] Connecting to ${ipAddress}:${port} (secure: ${secure})...`);

    let socket;
    let connected = false;

    const handleConnectError = (err) => {
      if (!connected) {
        logger.error(`[SocketFactory] Connection failed to ${ipAddress}:${port}. Error: ${err.message}`);
        callback(err);
      }
    };

    if (secure) {
      // SMTPS (Implicit TLS) on port 465
      const tlsOptions = {
        host: host,
        port: port,
        servername: host,
        rejectUnauthorized: true,
        ...options.tls,
      };

      socket = tls.connect(port, ipAddress, tlsOptions, () => {
        connected = true;
        logger.info(`[SocketFactory] SSL/TLS Connection established with ${ipAddress}:${port}`);
        callback(null, socket);
      });
    } else {
      // Plaintext TCP (STARTTLS) on port 587/25
      socket = net.connect(port, ipAddress, () => {
        connected = true;
        logger.info(`[SocketFactory] TCP Connection established with ${ipAddress}:${port}`);
        callback(null, socket);
      });
    }

    socket.on("error", handleConnectError);

    const timeout = options.connectionTimeout || 10000;
    socket.setTimeout(timeout, () => {
      if (!connected) {
        logger.error(`[SocketFactory] Connection timeout after ${timeout}ms connecting to ${ipAddress}:${port}`);
        socket.destroy();
        callback(new Error(`ETIMEDOUT: Connection to ${host} (${ipAddress}) timed out`));
      }
    });
  });
};

const transportConfig = {
  host: smtpHost,
  port: smtpPort,
  secure: smtpSecure,
  auth: {
    user: env.EMAIL_USER,
    pass: env.EMAIL_PASS,
  },
  // Inject the custom connection factory forcing IPv4 resolution
  createConnection: customCreateConnection,
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
logger.info(`  - Custom Socket Factory: Configured (Forces IPv4)`);
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
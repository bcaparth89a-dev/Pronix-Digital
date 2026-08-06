import { env } from "../config/env.js";
import { mailer } from "../config/mailer.js";
import { logger } from "../utils/logger.js";
import axios from "axios";

// Helper function to retry an async task with exponential backoff
async function retry(fn, retries = 3, delay = 1000) {
  try {
    return await fn();
  } catch (err) {
    if (retries <= 0) throw err;
    logger.warn(`Email send failed. Retrying in ${delay}ms... (Remaining retries: ${retries})`);
    await new Promise((resolve) => setTimeout(resolve, delay));
    return retry(fn, retries - 1, delay * 2);
  }
}

export async function sendEmail({ to, subject, html, text }) {
  return retry(async () => {
    // 1. Resend API Flow (Recommended for Production)
    if (env.RESEND_API_KEY) {
      logger.info(`Sending email via Resend API to ${to}...`);
      try {
        const response = await axios.post(
          "https://api.resend.com/emails",
          {
            from: env.MAIL_FROM || "onboarding@resend.dev",
            to,
            subject,
            html,
            text,
          },
          {
            headers: {
              Authorization: `Bearer ${env.RESEND_API_KEY}`,
              "Content-Type": "application/json",
            },
            timeout: 10000, // 10-second timeout
          }
        );
        logger.info(`Email Sent successfully via Resend to ${to}. ID: ${response.data.id}`);
        return response.data;
      } catch (err) {
        const errorMsg = err.response?.data?.message || err.message;
        logger.error(`Resend API Failed to send email to ${to}: ${errorMsg}`);
        throw new Error(`Resend delivery failed: ${errorMsg}`);
      }
    }

    // 2. SMTP Transporter Flow (Fallback)
    if (!mailer) {
      logger.error("Mailer is not initialized. SMTP credentials are missing.");
      throw new Error("Email service is not configured.");
    }

    logger.info(`Sending email via SMTP to ${to}...`);
    try {
      const info = await mailer.sendMail({
        from: env.MAIL_FROM,
        to,
        subject,
        html,
        text,
      });
      logger.info(`Email Sent successfully via SMTP to ${to}. MessageId: ${info.messageId}`);
      return info;
    } catch (err) {
      if (err.code === "EAUTH") {
        logger.error(`SMTP Authentication Failed during send to ${to}: Invalid App Password`);
      } else if (err.code === "ETIMEDOUT") {
        logger.error(`SMTP Timeout during send to ${to}. Possible firewall issue or network block.`);
      } else {
        logger.error(`SMTP Failed to send email to ${to}: ${err.message}`);
      }
      throw err;
    }
  });
}

import { env } from "../config/env.js";
import { mailer } from "../config/mailer.js";
import { logger } from "../utils/logger.js";

// Helper function to send email with up to 3 retries (exponential backoff)
async function sendWithRetry(mailOptions) {
  const maxRetries = 3;
  let attempt = 0;
  let delay = 1000;

  while (attempt <= maxRetries) {
    try {
      const info = await mailer.sendMail(mailOptions);
      if (attempt > 0) {
        logger.info("Email finally sent.");
      }
      return info;
    } catch (err) {
      attempt++;
      if (attempt > maxRetries) {
        logger.error("Email permanently failed.");
        throw err;
      }
      logger.warn("Retrying email...");
      await new Promise((resolve) => setTimeout(resolve, delay));
      delay *= 2;
    }
  }
}

export async function sendEmail({ to, subject, html, text, type }) {
  if (type === "client") {
    logger.info("Sending confirmation email...");
  } else if (type === "admin") {
    logger.info("Sending admin email...");
  } else {
    logger.info(`Sending email to ${to}...`);
  }

  if (!mailer) {
    logger.error("SMTP connection failed. Transporter is not initialized.");
    throw new Error("SMTP connection failed.");
  }

  const mailOptions = {
    from: env.MAIL_FROM || env.EMAIL_USER,
    to,
    subject,
    html,
    text,
  };

  const info = await sendWithRetry(mailOptions);
  
  if (type === "client") {
    logger.info("Confirmation email sent successfully.");
  } else if (type === "admin") {
    logger.info("Admin email sent successfully.");
  } else {
    logger.info(`Email sent successfully to ${to}.`);
  }
  
  return info;
}

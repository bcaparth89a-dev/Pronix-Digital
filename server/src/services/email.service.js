import { env } from "../config/env.js";
import { mailer } from "../config/mailer.js";

export async function sendEmail({ to, subject, html, text }) {
  return mailer.sendMail({
    from: env.MAIL_FROM,
    to,
    subject,
    html,
    text,
  });
}

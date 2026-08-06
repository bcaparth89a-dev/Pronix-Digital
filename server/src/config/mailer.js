import nodemailer from "nodemailer";
import { env } from "./env.js";

export const mailer = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  requireTLS: true,

  auth: {
    user: env.EMAIL_USER,
    pass: env.EMAIL_PASS,
  },

  family: 4,
});

mailer.verify((error, _success) => {
  if (error) {
    console.error("SMTP Connection Error:", error);
  } else {
    console.info("SMTP Server is Ready");
  }
});
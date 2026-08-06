import { httpStatus } from "../constants/httpStatus.js";
import { sendEmail } from "./email.service.js";
import { contactConfirmationTemplate, contactNotificationTemplate } from "../emails/templates.js";
import { env } from "../config/env.js";
import { logger } from "../utils/logger.js";
import { contactDto, contactListDto, publicContactDto } from "../dtos/contact.dto.js";
import { contactRepository } from "../repositories/contact.repository.js";
import { ApiError } from "../utils/ApiError.js";

export const contactService = {
  async list(query) {
    const result = await contactRepository.list(query);
    return {
      items: contactListDto(result.items),
      meta: result.meta,
    };
  },

  async getById(id) {
    const contact = await contactRepository.findById(id);

    if (!contact) {
      throw new ApiError(httpStatus.NOT_FOUND, "Contact not found");
    }

    return contactDto(contact);
  },

  async create(payload, requestMeta = {}) {
    const contact = await contactRepository.create({
      ...payload,
      metadata: requestMeta,
    });

    // Fire-and-forget emails with isolated logging for debugging
    logger.info(`Initiating emails: Confirmation to ${payload.email}, Admin Notification to ${env.ADMIN_NOTIFY_EMAILS}`);

    sendEmail({
      to: payload.email,
      subject: "We've received your message – Pronix Digital",
      html: contactConfirmationTemplate({
        name: payload.name,
        serviceInterest: payload.serviceInterest,
        budgetRange: payload.budgetRange,
      }),
    })
      .then(() => logger.info(`Confirmation email sent successfully to ${payload.email}`))
      .catch((err) => logger.error(`Failed to send confirmation email to ${payload.email}:`, err));

    sendEmail({
      to: env.ADMIN_NOTIFY_EMAILS,
      subject: `New Contact Inquiry from ${payload.name}`,
      html: contactNotificationTemplate(contact.toObject()),
    })
      .then(() => logger.info(`Admin notification email sent successfully to ${env.ADMIN_NOTIFY_EMAILS}`))
      .catch((err) => logger.error(`Failed to send admin notification email to ${env.ADMIN_NOTIFY_EMAILS}:`, err));

    return publicContactDto(contact.toObject());
  },

  async updateStatus(id, status) {
    const contact = await contactRepository.updateById(id, { status });

    if (!contact) {
      throw new ApiError(httpStatus.NOT_FOUND, "Contact not found");
    }

    return contactDto(contact);
  },

  async remove(id) {
    const contact = await contactRepository.deleteById(id);

    if (!contact) {
      throw new ApiError(httpStatus.NOT_FOUND, "Contact not found");
    }

    return contactDto(contact);
  },
};

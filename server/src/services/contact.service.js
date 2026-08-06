import { httpStatus } from "../constants/httpStatus.js";
import { sendEmail } from "./email.service.js";
import { contactConfirmationTemplate, contactNotificationTemplate } from "../emails/templates.js";
import { env } from "../config/env.js";
import { logger } from "../utils/logger.js";
import { contactDto, contactListDto, publicContactDto } from "../dtos/contact.dto.js";
import { contactRepository } from "../repositories/contact.repository.js";
import { ApiError } from "../utils/ApiError.js";
import { notificationService } from "./notification.service.js";
import { Contact } from "../models/Contact.model.js";

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

    // Create admin notification
    notificationService
      .create(
        `New Contact Request`,
        `${payload.name} is interested in ${payload.serviceInterest || "General"}. Budget: ${payload.budgetRange || "Unspecified"}.`,
        "contact",
        `/admin/contacts`
      )
      .catch((err) => logger.error("Failed to create admin notification for contact inquiry:", err));

    // Fire-and-forget emails with isolated logging for debugging
    sendEmail({
      to: payload.email,
      subject: "We've received your message – Pronix Digital",
      html: contactConfirmationTemplate({
        name: payload.name,
        serviceInterest: payload.serviceInterest,
        budgetRange: payload.budgetRange,
      }),
      type: "client",
    }).catch((err) => logger.error(`Client email workflow failed: ${err.message}`));

    sendEmail({
      to: env.ADMIN_NOTIFY_EMAILS,
      subject: `New Contact Inquiry from ${payload.name}`,
      html: contactNotificationTemplate(contact.toObject()),
      type: "admin",
    }).catch((err) => logger.error(`Admin email workflow failed: ${err.message}`));

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

  async updateNotes(id, notes) {
    const contact = await contactRepository.updateById(id, { notes });

    if (!contact) {
      throw new ApiError(httpStatus.NOT_FOUND, "Contact not found");
    }

    return contactDto(contact);
  },

  async bulkDelete(ids) {
    await contactRepository.bulkDelete(ids);
    return { success: true };
  },

  async bulkUpdateStatus(ids, status) {
    await contactRepository.bulkUpdateStatus(ids, status);
    return { success: true };
  },

  async getAnalytics() {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Start of this week (Sunday)
    const todayCopy = new Date(now);
    const startOfWeek = new Date(todayCopy.setDate(todayCopy.getDate() - todayCopy.getDay()));
    startOfWeek.setHours(0, 0, 0, 0);

    // Start of this month
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      total,
      today,
      thisWeek,
      thisMonth,
      pending,
      completed,
    ] = await Promise.all([
      Contact.countDocuments({}),
      Contact.countDocuments({ createdAt: { $gte: startOfToday } }),
      Contact.countDocuments({ createdAt: { $gte: startOfWeek } }),
      Contact.countDocuments({ createdAt: { $gte: startOfMonth } }),
      Contact.countDocuments({ status: { $in: ["new", "in-progress"] } }),
      Contact.countDocuments({ status: "closed" }),
    ]);

    const conversionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      total,
      today,
      thisWeek,
      thisMonth,
      pending,
      completed,
      conversionRate,
    };
  },
};

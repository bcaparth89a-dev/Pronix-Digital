import { notificationRepository } from "../repositories/notification.repository.js";

export const notificationService = {
  async getRecent() {
    const items = await notificationRepository.getRecent();
    const unreadCount = await notificationRepository.getUnreadCount();
    return {
      items,
      unreadCount,
    };
  },

  async markAllAsRead() {
    await notificationRepository.markAllAsRead();
    return { success: true };
  },

  async markAsRead(id) {
    return notificationRepository.updateById(id, { read: true });
  },

  async create(title, message, type = "contact", link = "") {
    return notificationRepository.create({ title, message, type, link });
  },
};

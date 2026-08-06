import { Notification } from "../models/Notification.model.js";
import { BaseRepository } from "./base.repository.js";

class NotificationRepository extends BaseRepository {
  constructor() {
    super(Notification);
  }

  async getUnreadCount() {
    return this.model.countDocuments({ read: false });
  }

  async markAllAsRead() {
    return this.model.updateMany({ read: false }, { read: true });
  }

  async getRecent(limit = 10) {
    return this.model.find({}).sort("-createdAt").limit(limit).lean();
  }
}

export const notificationRepository = new NotificationRepository();

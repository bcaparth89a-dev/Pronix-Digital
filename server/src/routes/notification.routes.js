import { Router } from "express";
import {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "../controllers/notification.controller.js";
import { authenticate } from "../middlewares/authenticate.js";
import { authorize } from "../middlewares/authorize.js";

export const notificationRouter = Router();

notificationRouter.get("/", authenticate, authorize("admin"), getNotifications);
notificationRouter.patch("/read-all", authenticate, authorize("admin"), markAllNotificationsRead);
notificationRouter.patch("/:id/read", authenticate, authorize("admin"), markNotificationRead);

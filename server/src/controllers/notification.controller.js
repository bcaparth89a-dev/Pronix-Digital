import { httpStatus } from "../constants/httpStatus.js";
import { notificationService } from "../services/notification.service.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getNotifications = asyncHandler(async (req, res) => {
  const result = await notificationService.getRecent();
  res.status(httpStatus.OK).json(new ApiResponse(httpStatus.OK, result, "Notifications fetched"));
});

export const markAllNotificationsRead = asyncHandler(async (req, res) => {
  const result = await notificationService.markAllAsRead();
  res.status(httpStatus.OK).json(new ApiResponse(httpStatus.OK, result, "All notifications marked as read"));
});

export const markNotificationRead = asyncHandler(async (req, res) => {
  const result = await notificationService.markAsRead(req.params.id);
  res.status(httpStatus.OK).json(new ApiResponse(httpStatus.OK, result, "Notification marked as read"));
});

import { createNotification } from "./notificationService.js";
import { emitNotificationToUser } from "../socket/index.js";

export async function createTaskNotifications({
  taskId,
  userIds,
  type,
  title,
  message,
  data = {},
  transaction,
}) {
  const notifications = [];

  for (const userId of [...new Set(userIds)].filter(Boolean)) {
    notifications.push(
      await createNotification({
        userId,
        type,
        title,
        message,
        data: {
          taskId,
          ...data,
        },
        transaction,
      }),
    );
  }

  return notifications;
}

export function emitTaskNotifications(notifications) {
  for (const notification of notifications) {
    try {
      emitNotificationToUser(notification.user_id, notification);
    } catch (error) {
      console.error("Realtime notification failed:", error.message);
    }
  }
}
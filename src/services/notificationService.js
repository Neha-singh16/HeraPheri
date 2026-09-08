import {
  Notification,
} from "../models/index.js";

// Create a persistent notification.
export async function createNotification({
  userId,
  type,
  title,
  message,
  data = null,
  transaction = undefined,
}) {
  return Notification.create(
    {
      user_id: userId,
      type,
      title,
      message,
      data,
      is_read: false,
    },
    {
      transaction,
    }
  );
}

// Get notifications for the logged-in user.
export async function getUserNotifications({
  userId,
  limit = 20,
}) {
  return Notification.findAll({
    where: {
      user_id: userId,
    },

    order: [
      ["created_at", "DESC"],
    ],

    limit,
  });
}

// Mark one notification as read.
export async function markNotificationAsRead({
  userId,
  notificationId,
}) {
  const notification =
    await Notification.findOne({
      where: {
        id: notificationId,
        user_id: userId,
      },
    });

  if (!notification) {
    throw new Error(
      "Notification not found."
    );
  }

  await notification.update({
    is_read: true,
    read_at: new Date(),
  });

  return notification;
}



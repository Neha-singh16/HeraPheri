import {
  getUserNotifications,
  markNotificationAsRead,
} from "../services/notificationService.js";

export async function getNotificationsController(
  req,
  res
) {
  try {
    const notifications =
      await getUserNotifications({
        userId: req.user.id,
      });

    return res.status(200).json({
      success: true,
      data: notifications,
    });

  } catch (error) {
    console.error(
      "Get notifications error:",
      error
    );

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

export async function markNotificationAsReadController(
  req,
  res
) {
  try {
    const notification =
      await markNotificationAsRead({
        userId: req.user.id,
        notificationId:
          req.params.notificationId,
      });

    return res.status(200).json({
      success: true,
      message:
        "Notification marked as read.",
      data: notification,
    });

  } catch (error) {
    console.error(
      "Mark notification as read error:",
      error
    );
    return res.status(404).json({
      success: false,
      message: error.message,
    });
  }
}

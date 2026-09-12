import { useEffect, useState } from "react";

import api from "../api/client.jsx";
import { useSocket } from "../context/SocketContext.jsx";

function formatDate(date) {
  if (!date) return "";

  return new Date(date).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function Notifications() {
  const { socket } = useSocket();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function fetchNotifications() {
    try {
      const response = await api.get("/notifications");

      setNotifications(response.data.data || []);
      setError("");
    } catch (error) {
      setError(
        error.response?.data?.message || "Unable to load notifications.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchNotifications();
  }, []);

  // Realtime notification
  useEffect(() => {
    if (!socket) return;

    function handleNewNotification(notification) {
      setNotifications((current) => {
        const exists = current.some((item) => item.id === notification.id);

        if (exists) return current;

        return [notification, ...current];
      });
    }

    socket.on("notification:new", handleNewNotification);

    return () => {
      socket.off("notification:new", handleNewNotification);
    };
  }, [socket]);

  async function markAsRead(notificationId) {
    try {
      await api.patch(`/notifications/${notificationId}/read`);

      setNotifications((current) =>
        current.map((notification) =>
          notification.id === notificationId
            ? {
                ...notification,
                is_read: true,
              }
            : notification,
        ),
      );

      window.dispatchEvent(new CustomEvent("notifications:changed"));
    } catch (error) {
      setError(
        error.response?.data?.message || "Unable to update notification.",
      );
    }
  }

  const unreadCount = notifications.filter(
    (notification) => !notification.is_read,
  ).length;

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <p className="eyebrow">ACTIVITY</p>

          <div className="page-title-row">
            <h1>Notifications</h1>

            {unreadCount > 0 && (
              <span className="notification-count">{unreadCount}</span>
            )}
          </div>

          <p className="page-description">
            Stay updated on your HEREPHERI activity.
          </p>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="empty-state">Loading notifications...</div>
      ) : notifications.length === 0 ? (
        <div className="empty-state">
          <h3>You're all caught up</h3>

          <p>New task activity will appear here automatically.</p>
        </div>
      ) : (
        <div className="notification-list">
          {notifications.map((notification) => (
            <article
              key={notification.id}
              className={
                notification.is_read
                  ? "notification-item read"
                  : "notification-item unread"
              }
              onClick={() =>
                !notification.is_read && markAsRead(notification.id)
              }
            >
              <div className="notification-icon">🔔</div>

              <div className="notification-content">
                <h3>{notification.title}</h3>

                <p>{notification.message}</p>

                <small>{formatDate(notification.created_at)}</small>
              </div>

              {!notification.is_read && <span className="unread-dot" />}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

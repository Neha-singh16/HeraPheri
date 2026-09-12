import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { useAuth } from "../context/AuthContext.jsx";
import { useSocket } from "../context/SocketContext.jsx";
import api from "../api/client.jsx";
import ModeSwitcher from "./ModeSwitcher.jsx";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { socket } = useSocket();

  const [menuOpen, setMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

async function fetchUnreadCount() {
  try {
    const response =
      await api.get("/notifications");

    const unread = (
      response.data.data || []
    ).filter(
      (notification) =>
        !notification.is_read,
    ).length;

    setUnreadCount(unread);
  } catch (error) {
    console.error(
      "Unable to fetch notification count:",
      error,
    );
  }
}

 useEffect(() => {
    fetchUnreadCount();

  function handleNotificationChange() {
    fetchUnreadCount();
  }

  window.addEventListener(
    "notifications:changed",
    handleNotificationChange,
  );

  return () => {
    window.removeEventListener(
      "notifications:changed",
      handleNotificationChange,
    );
  };
}, []);

  useEffect(() => {
    if (!socket) return;

    function handleNewNotification() {
      setUnreadCount((count) => count + 1);
    }

    socket.on("notification:new", handleNewNotification);

    return () => {
      socket.off("notification:new", handleNewNotification);
    };
  }, [socket]);

  return (
    <header className="navbar">
      <Link to="/dashboard" className="navbar-brand">
        <span>HERE</span>
        <strong>PHERI</strong>
      </Link>

      <div className="navbar-actions">
        <ModeSwitcher />

        {user?.role === "ADMIN" && (
          <Link to="/admin/disputes" className="admin-nav-link">
            Disputes
          </Link>
        )}

        <Link
          to="/notifications"
          className="notification-button"
          aria-label="Notifications"
        >
          🔔
          {unreadCount > 0 && (
            <span className="notification-badge">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Link>

        <div className="user-menu">
          <button
            className="user-button"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <span>{user?.name}</span>
            <span>▾</span>
          </button>

          {menuOpen && (
            <div className="user-dropdown">
              <Link to="/profile" onClick={() => setMenuOpen(false)}>
                Profile
              </Link>

              <button onClick={logout}>Logout</button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

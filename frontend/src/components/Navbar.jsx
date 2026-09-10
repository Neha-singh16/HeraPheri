import { useState } from "react";

import { Link } from "react-router-dom";

import { useAuth } from "../context/AuthContext.jsx";
import ModeSwitcher
  from "./ModeSwitcher.jsx";
export default function Navbar() {
  const { user, logout } = useAuth();

  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="navbar">
      {/* Brand */}
      <Link to="/dashboard" className="navbar-brand">
        <span>HERE</span>
        <strong>PHERI</strong>
      </Link>

      {/* Right side */}
      <div className="navbar-actions">
        {/* <button className="notification-button" aria-label="Notifications">
          🔔
        </button> */}
        <ModeSwitcher />
        <Link
          to="/notifications"
          className="notification-button"
          aria-label="Notifications"
        >
          {" "}
          🔔{" "}
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

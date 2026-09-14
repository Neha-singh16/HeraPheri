import { useState } from "react";
import { Link } from "react-router-dom";

import { useAuth } from "../context/AuthContext.jsx";

export default function AdminNavbar() {
  const { user, logout } = useAuth();

  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="navbar admin-navbar">
      <Link to="/admin" className="navbar-brand">
        <span>HERE</span>
        <strong>PHERI</strong>
      </Link>

      <div className="admin-navbar-center">
        <span className="admin-console-label">ADMIN CONSOLE</span>
      </div>

      <div className="navbar-actions">
        <div className="admin-role-badge">ADMIN</div>

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

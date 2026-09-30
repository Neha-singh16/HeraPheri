import { Outlet } from "react-router-dom";
import { useEffect, useState } from "react";

import AdminNavbar from "./AdminNavbar.jsx";
import AdminSidebar from "./AdminSidebar.jsx";

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [sidebarOpen]);

  return (
    <div className={`app-layout admin-layout ${sidebarOpen ? "sidebar-is-open" : ""}`}>
      <AdminNavbar onMenuClick={() => setSidebarOpen(true)} />

      <div className="app-body">
        <AdminSidebar onNavigate={() => setSidebarOpen(false)} />

        <button
          className="sidebar-backdrop"
          type="button"
          aria-label="Close navigation"
          onClick={() => setSidebarOpen(false)}
        />

        <main className="main-content admin-main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
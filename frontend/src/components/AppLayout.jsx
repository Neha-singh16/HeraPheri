import {
  Outlet,
} from "react-router-dom";
import { useEffect, useState } from "react";

import Navbar from "./Navbar.jsx";
import Sidebar from "./Sidebar.jsx";


export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [sidebarOpen]);

  return (
    <div className={`app-layout ${sidebarOpen ? "sidebar-is-open" : ""}`}>

      <Navbar onMenuClick={() => setSidebarOpen(true)} />

      <div className="app-body">

        <Sidebar onNavigate={() => setSidebarOpen(false)} />

        <button
          className="sidebar-backdrop"
          type="button"
          aria-label="Close navigation"
          onClick={() => setSidebarOpen(false)}
        />

        <main className="main-content">

          <Outlet />

        </main>

      </div>

    </div>
  );
}


import { Outlet } from "react-router-dom";

import AdminNavbar from "./AdminNavbar.jsx";
import AdminSidebar from "./AdminSidebar.jsx";

export default function AdminLayout() {
  return (
    <div className="app-layout admin-layout">
      <AdminNavbar />

      <div className="app-body">
        <AdminSidebar />

        <main className="main-content admin-main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
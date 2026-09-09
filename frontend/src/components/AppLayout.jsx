import {
  Outlet,
} from "react-router-dom";

import Navbar from "./Navbar.jsx";
import Sidebar from "./Sidebar.jsx";


export default function AppLayout() {

  return (
    <div className="app-layout">

      <Navbar />

      <div className="app-body">

        <Sidebar />

        <main className="main-content">

          <Outlet />

        </main>

      </div>

    </div>
  );
}


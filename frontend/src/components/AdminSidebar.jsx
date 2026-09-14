import { NavLink } from "react-router-dom";

const adminNavigation = [
  {
    label: "Overview",
    path: "/admin",
    icon: "⌂",
  },
  {
    label: "Disputes",
    path: "/admin/disputes",
    icon: "⚖",
  },
];

export default function AdminSidebar() {
  return (
    <aside className="sidebar admin-sidebar">
      <div className="admin-sidebar-heading">PLATFORM</div>

      <nav>
        {adminNavigation.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === "/admin"}
            className={({ isActive }) =>
              isActive ? "sidebar-link active" : "sidebar-link"
            }
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="admin-sidebar-note">
          <strong>Admin</strong>

          <span>Platform operations</span>
        </div>
      </div>
    </aside>
  );
}

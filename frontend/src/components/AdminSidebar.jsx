import { NavLink } from "react-router-dom";

const mainNavigation = [
  {
    label: "Overview",
    path: "/admin",
    icon: "⌂",
  },
  {
    label: "Users",
    path: "/admin/users",
    icon: "♙",
  },
  {
    label: "Verifications",
    path: "/admin/verifications",
    icon: "✓",
  },
  {
    label: "Disputes",
    path: "/admin/disputes",
    icon: "⚖",
  },
];

const operationsNavigation = [
  {
    label: "Tasks",
    path: "/admin/tasks",
    icon: "▣",
    disabled: true,
  },
  {
    label: "Payments",
    path: "/admin/payments",
    icon: "₹",
    disabled: true,
  },
  {
    label: "Audit Log",
    path: "/admin/audit",
    icon: "◷",
    disabled: true,
  },
];

function NavigationItem({ item }) {
  if (item.disabled) {
    return (
      <div className="sidebar-link disabled" title="Coming soon">
        <span>{item.icon}</span>

        <span>{item.label}</span>
      </div>
    );
  }

  return (
    <NavLink
      to={item.path}
      end={item.path === "/admin"}
      className={({ isActive }) =>
        isActive ? "sidebar-link active" : "sidebar-link"
      }
    >
      <span>{item.icon}</span>

      <span>{item.label}</span>
    </NavLink>
  );
}

export default function AdminSidebar() {
  return (
    <aside className="sidebar admin-sidebar">
      <div className="admin-sidebar-heading">PLATFORM</div>

      <nav>
        {mainNavigation.map((item) => (
          <NavigationItem key={item.path} item={item} />
        ))}
      </nav>

      <div className="admin-sidebar-heading admin-sidebar-section">
        OPERATIONS
      </div>

      <nav>
        {operationsNavigation.map((item) => (
          <NavigationItem key={item.path} item={item} />
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="admin-sidebar-note">
          <strong>Admin Console</strong>

          <span>Platform operations</span>
        </div>
      </div>
    </aside>
  );
}

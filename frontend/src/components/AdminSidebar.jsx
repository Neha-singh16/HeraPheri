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
    icon: "▣",
    disabled: true,
  },
  {
    label: "Payments",
    icon: "₹",
    disabled: true,
  },
  {
    label: "Audit Log",
    icon: "◷",
    disabled: true,
  },
];

function NavigationItem({ item }) {
  if (item.disabled) {
    return (
      <div className="sidebar-link admin-nav-disabled">
        <span className="admin-nav-icon">
          {item.icon}
        </span>

        <span>{item.label}</span>

        <small>Later</small>
      </div>
    );
  }

  return (
    <NavLink
      to={item.path}
      end={item.path === "/admin"}
      className={({ isActive }) =>
        isActive
          ? "sidebar-link active"
          : "sidebar-link"
      }
    >
      <span className="admin-nav-icon">
        {item.icon}
      </span>

      <span>{item.label}</span>
    </NavLink>
  );
}

export default function AdminSidebar() {
  return (
    <aside className="sidebar admin-sidebar">
      <div className="admin-sidebar-top">
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
      </div>

      <div className="sidebar-footer">
        <div className="admin-sidebar-note">
          <strong>Admin Console</strong>
          <span>Platform operations</span>
        </div>
      </div>
    </aside>
  );
}

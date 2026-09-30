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
  },
  {
    label: "Payments",
    path: "/admin/payments",
    icon: "₹",
  },
  {
    label: "Audit Log",
    path: "/admin/audit",
    icon: "◷",
  },
];

function NavigationItem({ item, onNavigate }) {
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
      onClick={onNavigate}
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

export default function AdminSidebar({ onNavigate }) {
  return (
    <aside className="sidebar admin-sidebar">
      <button
        className="sidebar-close-button"
        type="button"
        aria-label="Close navigation"
        onClick={onNavigate}
      >
        <span />
        <span />
      </button>

      <div className="admin-sidebar-top">
        <div className="admin-sidebar-heading">PLATFORM</div>

        <nav>
          {mainNavigation.map((item) => (
            <NavigationItem
              key={item.path}
              item={item}
              onNavigate={onNavigate}
            />
          ))}
        </nav>

        <div className="admin-sidebar-heading admin-sidebar-section">
          OPERATIONS
        </div>

        <nav>
          {operationsNavigation.map((item) => (
            <NavigationItem
              key={item.path}
              item={item}
              onNavigate={onNavigate}
            />
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

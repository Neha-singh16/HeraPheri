import { NavLink } from "react-router-dom";

const navigation = [
  {
    label: "Dashboard",
    path: "/dashboard",
    icon: "⌂",
  },

  {
    label: "My Tasks",
    path: "/tasks",
    icon: "✓",
  },

  {
    label: "Find Tasks",
    path: "/find-tasks",
    icon: "⌕",
  },

  {
    label: "Executor",
    path: "/executor-profile",
    icon: "◉",
  },

  {
  label: "Reputation",
  path: "/reputation",
  icon: "★",
},
  {
    label: "Payments",
    path: "/payments",
    icon: "₹",
  },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <nav>
        {navigation.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
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
        <NavLink to="/settings" className="sidebar-link">
          ⚙<span>Settings</span>
        </NavLink>
      </div>
    </aside>
  );
}

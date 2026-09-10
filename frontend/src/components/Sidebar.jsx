// import { NavLink } from "react-router-dom";

// const navigation = [
//   {
//     label: "Dashboard",
//     path: "/dashboard",
//     icon: "⌂",
//   },

//   {
//     label: "My Tasks",
//     path: "/tasks",
//     icon: "✓",
//   },

//   {
//     label: "Find Tasks",
//     path: "/find-tasks",
//     icon: "⌕",
//   },

//   {
//     label: "Executor",
//     path: "/executor-profile",
//     icon: "◉",
//   },

//   {
//   label: "Reputation",
//   path: "/reputation",
//   icon: "★",
// },
//   {
//     label: "Payments",
//     path: "/payments",
//     icon: "₹",
//   },
// ];

// export default function Sidebar() {
//   return (
//     <aside className="sidebar">
//       <nav>
//         {navigation.map((item) => (
//           <NavLink
//             key={item.path}
//             to={item.path}
//             className={({ isActive }) =>
//               isActive ? "sidebar-link active" : "sidebar-link"
//             }
//           >
//             <span>{item.icon}</span>

//             <span>{item.label}</span>
//           </NavLink>
//         ))}
//       </nav>

//       <div className="sidebar-footer">
//         <NavLink to="/settings" className="sidebar-link">
//           ⚙<span>Settings</span>
//         </NavLink>
//       </div>
//     </aside>
//   );
// }

import { NavLink } from "react-router-dom";

import { useMode } from "../context/ModeContext.jsx";

export default function Sidebar() {
  const { mode } = useMode();

  const requesterNavigation = [
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
      label: "Create Task",
      path: "/tasks/create",
      icon: "+",
    },

    {
      label: "Notifications",
      path: "/notifications",
      icon: "🔔",
    },

    {
      label: "Reputation",
      path: "/reputation",
      icon: "★",
    },
  ];

  const executorNavigation = [
    {
      label: "Dashboard",
      path: "/dashboard",
      icon: "⌂",
    },

    {
      label: "Find Tasks",
      path: "/find-tasks",
      icon: "⌕",
    },

    {
      label: "My Assignments",
      path: "/executor/assignments",
      icon: "✓",
    },

    {
      label: "Executor Profile",
      path: "/executor-profile",
      icon: "◉",
    },

    {
      label: "Reputation",
      path: "/reputation",
      icon: "★",
    },

    {
      label: "Notifications",
      path: "/notifications",
      icon: "🔔",
    },
  ];

  const navigation =
    mode === "EXECUTOR" ? executorNavigation : requesterNavigation;

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
          <span>⚙</span>

          <span>Settings</span>
        </NavLink>
      </div>
    </aside>
  );
}

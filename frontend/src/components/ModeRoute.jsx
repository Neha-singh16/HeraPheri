// import { Navigate } from "react-router-dom";

// import { useMode } from "../context/ModeContext.jsx";

// export default function ModeRoute({ requiredMode, children }) {
//   const { mode, hasExecutorProfile, checkingExecutor } = useMode();

//   if (checkingExecutor) {
//     return <div className="empty-state">Loading...</div>;
//   }

//   if (requiredMode === "EXECUTOR" && !hasExecutorProfile) {
//     return <Navigate to="/executor-profile" replace />;
//   }

//   if (mode !== requiredMode) {
//     return <Navigate to="/dashboard" replace />;
//   }

//   return children;
// }

import { Navigate } from "react-router-dom";

import { useMode } from "../context/ModeContext.jsx";

export default function ModeRoute({ mode, children }) {
  const { mode: activeMode, hasExecutorProfile, capabilityLoading } = useMode();

  /*
    Wait until we know whether the user
    actually has Executor capability.
  */
  if (mode === "EXECUTOR" && capabilityLoading) {
    return <div className="empty-state">Checking Executor access...</div>;
  }

  /*
    Executor-only route
  */
  if (mode === "EXECUTOR") {
    if (!hasExecutorProfile) {
      return <Navigate to="/executor-profile" replace />;
    }

    if (activeMode !== "EXECUTOR") {
      return <Navigate to="/dashboard" replace />;
    }
  }

  /*
    Requester-only route
  */
  if (mode === "REQUESTER") {
    if (activeMode !== "REQUESTER") {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
}

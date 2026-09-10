import { Navigate } from "react-router-dom";

import { useMode } from "../context/ModeContext.jsx";

export default function ModeRoute({ requiredMode, children }) {
  const { mode, hasExecutorProfile, checkingExecutor } = useMode();

  if (checkingExecutor) {
    return <div className="empty-state">Loading...</div>;
  }

  if (requiredMode === "EXECUTOR" && !hasExecutorProfile) {
    return <Navigate to="/executor-profile" replace />;
  }

  if (mode !== requiredMode) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

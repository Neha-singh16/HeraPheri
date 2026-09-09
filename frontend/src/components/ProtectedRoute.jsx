import {
  Navigate,
} from "react-router-dom";

import {
  useAuth,
} from "../context/AuthContext.jsx";

export default function ProtectedRoute({
  children,
}) {
  const {
    isAuthenticated,
  } = useAuth();

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  return children;
}


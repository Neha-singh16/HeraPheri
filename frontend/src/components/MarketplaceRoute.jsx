import { Navigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext.jsx";

export default function MarketplaceRoute({ children }) {
  const { user } = useAuth();

  if (user?.role === "ADMIN") {
    return <Navigate to="/admin" replace />;
  }

  return children;
}

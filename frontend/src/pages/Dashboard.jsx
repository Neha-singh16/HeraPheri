

import {
  Navigate,
} from "react-router-dom";

import { useAuth } from "../context/AuthContext.jsx";
import { useMode } from "../context/ModeContext.jsx";

import RequesterDashboard from "./RequesterDashboard.jsx";
import ExecutorDashboard from "./ExecutorDashboard.jsx";


export default function Dashboard() {
  const { user } = useAuth();
  const { isExecutor } = useMode();

  if (user?.role === "ADMIN") {
    return (
      <Navigate
        to="/admin"
        replace
      />
    );
  }

  return isExecutor ? (
    <ExecutorDashboard />
  ) : (
    <RequesterDashboard />
  );
}
import { Routes, Route, Navigate } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext.jsx";

import ProtectedRoute from "./components/ProtectedRoute.jsx";
import AppLayout from "./components/AppLayout.jsx";

import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import MyTasks from "./pages/MyTasks.jsx";
import FindTasks from "./pages/FindTasks.jsx";
import TaskDetails from "./pages/TaskDetails.jsx";

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />

        {/* Protected application */}
        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />

          <Route path="/tasks" element={<MyTasks />} />
          <Route path="/tasks/:taskId" element={<TaskDetails />} />
          <Route path="/find-tasks" element={<FindTasks />} />

          <Route
            path="/executor-profile"
            element={<div>Executor Profile coming soon.</div>}
          />

          <Route path="/payments" element={<div>Payments coming soon.</div>} />

          <Route path="/settings" element={<div>Settings coming soon.</div>} />

          <Route path="/profile" element={<div>Profile coming soon.</div>} />
        </Route>

        {/* Default */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;

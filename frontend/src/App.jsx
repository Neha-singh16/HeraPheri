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
import TaskMatches from "./pages/TaskMatches.jsx";
import CreateTask from "./pages/CreateTask.jsx";
import TaskExecution from "./pages/TaskExecution.jsx";
import TaskReview from "./pages/TaskReview.jsx";
import Payment from "./pages/Payment.jsx";
import Notifications from "./pages/Notifications.jsx";
import Reputation from "./pages/Reputation.jsx";

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
          <Route path="/tasks/create" element={<CreateTask />} />
          <Route
            path="/tasks/:taskId/execute"
            element={<TaskExecution />}
          />{" "}
          <Route path="/tasks/:taskId/review" element={<TaskReview />} />
          <Route path="/tasks/:taskId/matches" element={<TaskMatches />} />
          <Route path="/tasks/:taskId" element={<TaskDetails />} />
          <Route path="/find-tasks" element={<FindTasks />} />
          <Route
            path="/executor-profile"
            element={<div>Executor Profile coming soon.</div>}
          />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/tasks/:taskId/payment" element={<Payment />} />
          <Route path="/reputation" element={<Reputation />} />
          <Route path="/settings" element={<div>Settings coming soon.</div>} />
          <Route path="/profile" element={<div>Profile coming soon.</div>} />
        </Route>

        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;

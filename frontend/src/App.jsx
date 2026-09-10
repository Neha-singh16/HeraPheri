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
import ExecutorProfile from "./pages/ExecutorProfile.jsx";
import ExecutorAssignments from "./pages/ExecutorAssignments.jsx";
import { ModeProvider } from "./context/ModeContext.jsx";

import ModeRoute from "./components/ModeRoute.jsx";

function App() {
  return (
    <AuthProvider>
      <ModeProvider>
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
            {/* Shared routes */}
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/reputation" element={<Reputation />} />

            {/* REQUESTER ONLY */}
            <Route
              path="/tasks"
              element={
                <ModeRoute requiredMode="REQUESTER">
                  <MyTasks />
                </ModeRoute>
              }
            />
            <Route
              path="/tasks/create"
              element={
                <ModeRoute requiredMode="REQUESTER">
                  <CreateTask />
                </ModeRoute>
              }
            />

            <Route
              path="/tasks/:taskId/review"
              element={
                <ModeRoute requiredMode="REQUESTER">
                  <TaskReview />
                </ModeRoute>
              }
            />
            <Route
              path="/tasks/:taskId/matches"
              element={
                <ModeRoute requiredMode="REQUESTER">
                  <TaskMatches />
                </ModeRoute>
              }
            />
            {/* Task details can be shared */}
            <Route path="/tasks/:taskId" element={<TaskDetails />} />
            <Route
              path="/tasks/:taskId/payment"
              element={
                <ModeRoute requiredMode="REQUESTER">
                  <Payment />
                </ModeRoute>
              }
            />
            {/* EXECUTOR ONLY */}
            <Route
              path="/find-tasks"
              element={
                <ModeRoute requiredMode="EXECUTOR">
                  <FindTasks />
                </ModeRoute>
              }
            />
            <Route
              path="/executor/assignments"
              element={
                <ModeRoute requiredMode="EXECUTOR">
                  <ExecutorAssignments />
                </ModeRoute>
              }
            />
            {/* /executor-profile needs to be accessible to a Requester who hasn't become an Executor yet. */}
            <Route path="/executor-profile" element={<ExecutorProfile />} />

            <Route
              path="/tasks/:taskId/execute"
              element={
                <ModeRoute requiredMode="EXECUTOR">
                  <TaskExecution />
                </ModeRoute>
              }
            />

            {/* Task details can be shared */}
            <Route path="/tasks/:taskId" element={<TaskDetails />} />

            <Route
              path="/settings"
              element={<div>Settings coming soon.</div>}
            />
            <Route path="/profile" element={<div>Profile coming soon.</div>} />
          </Route>

          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </ModeProvider>
    </AuthProvider>
  );
}

export default App;

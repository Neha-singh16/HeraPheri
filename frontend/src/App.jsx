import { Navigate, Route, Routes } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext.jsx";

import { ModeProvider } from "./context/ModeContext.jsx";

import { SocketProvider } from "./context/SocketContext.jsx";

import ProtectedRoute from "./components/ProtectedRoute.jsx";
import ModeRoute from "./components/ModeRoute.jsx";
import MarketplaceRoute from "./components/MarketplaceRoute.jsx";
import AdminRoute from "./components/AdminRoute.jsx";

import AppLayout from "./components/AppLayout.jsx";
import AdminLayout from "./components/AdminLayout.jsx";

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
import Earnings from "./pages/Earnings.jsx";

import AdminDisputes from "./pages/AdminDisputes.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import AdminUsers from "./pages/AdminUsers.jsx";
import AdminTasks from "./pages/AdminTasks.jsx";
import AdminPayments from "./pages/AdminPayments.jsx";
import AdminAudit from "./pages/AdminAudit.jsx";
import AdminVerifications from "./pages/AdminVerifications.jsx";

function App() {
  return (
    <AuthProvider>
      <ModeProvider>
        <SocketProvider>
          <Routes>
            {/* PUBLIC */}

            <Route path="/login" element={<Login />} />

            <Route path="/register" element={<Register />} />

            {/* MARKETPLACE APPLICATION */}
            <Route
              element={
                <ProtectedRoute>
                  <MarketplaceRoute>
                    <AppLayout />
                  </MarketplaceRoute>
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard" element={<Dashboard />} />

              {/* REQUESTER */}

              <Route
                path="/tasks"
                element={
                  <ModeRoute mode="REQUESTER">
                    <MyTasks />
                  </ModeRoute>
                }
              />

              <Route
                path="/tasks/create"
                element={
                  <ModeRoute mode="REQUESTER">
                    <CreateTask />
                  </ModeRoute>
                }
              />

              <Route
                path="/tasks/:taskId/review"
                element={
                  <ModeRoute mode="REQUESTER">
                    <TaskReview />
                  </ModeRoute>
                }
              />

              <Route
                path="/tasks/:taskId/matches"
                element={
                  <ModeRoute mode="REQUESTER">
                    <TaskMatches />
                  </ModeRoute>
                }
              />

              <Route
                path="/tasks/:taskId/payment"
                element={
                  <ModeRoute mode="REQUESTER">
                    <Payment />
                  </ModeRoute>
                }
              />

              {/* EXECUTOR */}

              <Route
                path="/find-tasks"
                element={
                  <ModeRoute mode="EXECUTOR">
                    <FindTasks />
                  </ModeRoute>
                }
              />

              <Route
                path="/executor/assignments"
                element={
                  <ModeRoute mode="EXECUTOR">
                    <ExecutorAssignments />
                  </ModeRoute>
                }
              />

              <Route
                path="/tasks/:taskId/execute"
                element={
                  <ModeRoute mode="EXECUTOR">
                    <TaskExecution />
                  </ModeRoute>
                }
              />

              <Route
                path="/earnings"
                element={
                  <ModeRoute mode="EXECUTOR">
                    <Earnings />
                  </ModeRoute>
                }
              />

              {/* SHARED MARKETPLACE */}

              <Route path="/executor-profile" element={<ExecutorProfile />} />

              <Route path="/tasks/:taskId" element={<TaskDetails />} />

              <Route path="/notifications" element={<Notifications />} />

              <Route path="/reputation" element={<Reputation />} />

              <Route
                path="/profile"
                element={<div>Profile coming soon.</div>}
              />

              <Route
                path="/settings"
                element={<div>Settings coming soon.</div>}
              />
            </Route>

            {/* ADMIN APPLICATION */}

            <Route
              element={
                <ProtectedRoute>
                  <AdminRoute>
                    <AdminLayout />
                  </AdminRoute>
                </ProtectedRoute>
              }
            >

              <Route
  path="/admin"
  element={<AdminDashboard />}
/>

<Route
  path="/admin/users"
  element={<AdminUsers />}
/>

<Route
  path="/admin/verifications"
  element={<AdminVerifications />}
/>

<Route
  path="/admin/disputes"
  element={<AdminDisputes />}
/>
<Route
  path="/admin/tasks"
  element={<AdminTasks />}
/>

<Route
  path="/admin/payments"
  element={<AdminPayments />}
/>

<Route
  path="/admin/audit"
  element={<AdminAudit />}
/>
     
            </Route>

            {/* DEFAULTS */}

            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </SocketProvider>
      </ModeProvider>
    </AuthProvider>
  );
}

export default App;

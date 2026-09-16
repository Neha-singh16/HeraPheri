import { createContext, useContext, useEffect, useState } from "react";

import { io } from "socket.io-client";
import Toast from "../components/Toast.jsx";
import { useAuth } from "./AuthContext.jsx";

const SocketContext = createContext(null);

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ||
  import.meta.env.VITE_API_BASE_URL?.replace("/api/v1", "") ||
  "";

const TASK_EVENT_MESSAGES = {
  TASK_ASSIGNED: "Your task has been accepted.",
  PAYMENT_HELD: "Task payment has been secured.",
  TASK_STARTED: "The task has started.",
  PROOF_SUBMITTED: "Work has been submitted for review.",
  TASK_APPROVED: "Task completed and payment released.",
  TASK_DISPUTED: "A dispute has been raised for this task.",
  TASK_CANCELLED: "This task has been cancelled.",
  TASK_RELEASED: "The Executor released the task.",
  TASK_EXPIRED: "This task has expired.",
  TASK_DEADLINE_NEAR: "This task's deadline is within one hour.",
  TASK_DEADLINE_PASSED:
    "A task deadline has passed and the task is still active.",
};

export function SocketProvider({ children }) {
  const { user } = useAuth();
  const [connected, setConnected] = useState(false);
  const [socket, setSocket] = useState(null);
  const [toastMessage, setToastMessage] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("accessToken");

    if (!user?.id || !token || !SOCKET_URL) {
      setSocket(null);
      return;
    }

    const connection = io(SOCKET_URL, {
      transports: ["websocket"],
      auth: {
        token,
      },
    });

    connection.on("connect", () => {
      setConnected(true);
      console.log("🔌 HEREPHERI realtime connected");
    });

    connection.on("disconnect", () => {
      setConnected(false);
    });
    connection.on("disconnect", (reason) => {
      console.log("🔌 HEREPHERI realtime disconnected:", reason);
    });

    connection.on("connect_error", (error) => {
      console.error("Realtime connection error:", error.message);
    });

    function handleTaskUpdated({ reason }) {
      const message = TASK_EVENT_MESSAGES[reason];

      if (message) {
        setToastMessage(message);
      }
    }

    connection.on("task:updated", handleTaskUpdated);
    setSocket(connection);

    return () => {
      connection.off("task:updated", handleTaskUpdated);
      connection.disconnect();
      setSocket(null);
    };
  }, [user?.id]);

  return (
    <SocketContext.Provider
      value={{
        socket,
        connected,
      }}
    >
      {children}
      <Toast message={toastMessage} onClose={() => setToastMessage("")} />
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);

  if (!context) {
    throw new Error("useSocket must be used inside SocketProvider.");
  }

  return context;
}

import { createContext, useContext, useEffect, useState } from "react";

import { io } from "socket.io-client";

import { useAuth } from "./AuthContext.jsx";

const SocketContext = createContext(null);

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ||
  import.meta.env.VITE_API_BASE_URL?.replace("/api/v1", "") ||
  "";

export function SocketProvider({ children }) {
  const { user } = useAuth();

  const [socket, setSocket] = useState(null);

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
      console.log("🔌 HEREPHERI realtime connected");
    });

    connection.on("disconnect", (reason) => {
      console.log("🔌 HEREPHERI realtime disconnected:", reason);
    });

    connection.on("connect_error", (error) => {
      console.error("Realtime connection error:", error.message);
    });

    setSocket(connection);

    return () => {
      connection.disconnect();
      setSocket(null);
    };
  }, [user?.id]);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
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

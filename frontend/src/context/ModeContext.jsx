import { createContext, useContext, useEffect, useState } from "react";

import api from "../api/client.jsx";

import { useAuth } from "./AuthContext.jsx";

const ModeContext = createContext(null);

export function ModeProvider({ children }) {
  const { user, isAuthenticated } = useAuth();

  const [mode, setModeState] = useState("REQUESTER");

  const [hasExecutorProfile, setHasExecutorProfile] = useState(false);

  const [checkingExecutor, setCheckingExecutor] = useState(true);

  useEffect(() => {
    async function loadExecutorCapability() {
      if (!isAuthenticated || !user) {
        setModeState("REQUESTER");
        setHasExecutorProfile(false);
        setCheckingExecutor(false);
        return;
      }

      setCheckingExecutor(true);

      try {
        await api.get("/executor-profile");

        // Executor profile exists.
        setHasExecutorProfile(true);

        const savedMode = localStorage.getItem(`activeMode:${user.id}`);

        if (savedMode === "EXECUTOR") {
          setModeState("EXECUTOR");
        } else {
          setModeState("REQUESTER");
        }
      } catch (error) {
        if (error.response?.status === 404) {
          // This user is not an Executor yet.
          setHasExecutorProfile(false);
          setModeState("REQUESTER");

          localStorage.removeItem(`activeMode:${user.id}`);
        } else {
          console.error("Executor capability check failed:", error);

          setModeState("REQUESTER");
        }
      } finally {
        setCheckingExecutor(false);
      }
    }

    loadExecutorCapability();
  }, [isAuthenticated, user]);

  function setMode(newMode) {
    if (newMode === "REQUESTER") {
      setModeState("REQUESTER");

      if (user) {
        localStorage.setItem(`activeMode:${user.id}`, "REQUESTER");
      }

      return;
    }

    if (newMode === "EXECUTOR" && hasExecutorProfile) {
      setModeState("EXECUTOR");

      if (user) {
        localStorage.setItem(`activeMode:${user.id}`, "EXECUTOR");
      }
    }
  }

  async function refreshExecutorCapability() {
    try {
      await api.get("/executor-profile");

      setHasExecutorProfile(true);
    } catch (error) {
      if (error.response?.status === 404) {
        setHasExecutorProfile(false);
        setModeState("REQUESTER");
      }
    }
  }

  const isRequester = mode === "REQUESTER";

  const isExecutor = mode === "EXECUTOR";

  return (
    <ModeContext.Provider
      value={{
        mode,
        setMode,

        isRequester,
        isExecutor,

        hasExecutorProfile,

        checkingExecutor,

        refreshExecutorCapability,
      }}
    >
      {children}
    </ModeContext.Provider>
  );
}

export function useMode() {
  const context = useContext(ModeContext);

  if (!context) {
    throw new Error("useMode must be used inside ModeProvider.");
  }

  return context;
}

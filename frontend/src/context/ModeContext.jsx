import { createContext, useContext, useEffect, useState } from "react";

import { useAuth } from "./AuthContext.jsx";
import api from "../api/client.jsx";

const ModeContext = createContext(null);

export function ModeProvider({ children }) {
  const { user } = useAuth();

  const [mode, setModeState] = useState("REQUESTER");
  const [hasExecutorProfile, setHasExecutorProfile] = useState(false);
  const [capabilityLoading, setCapabilityLoading] = useState(true);

  const isAdmin = user?.role === "ADMIN";

  async function refreshExecutorCapability() {
    if (!user?.id || isAdmin) {
      setHasExecutorProfile(false);
      setCapabilityLoading(false);
      return false;
    }

    setCapabilityLoading(true);

    try {
      await api.get("/executor-profile");
      setHasExecutorProfile(true);
      return true;
    } catch (error) {
      if (error.response?.status !== 404) {
        console.error("Unable to check Executor capability:", error);
      }

      setHasExecutorProfile(false);
      return false;
    } finally {
      setCapabilityLoading(false);
    }
  }

  useEffect(() => {
    if (!user?.id) {
      setModeState("REQUESTER");
      setHasExecutorProfile(false);
      setCapabilityLoading(false);
      return;
    }

    if (isAdmin) {
      setModeState("ADMIN");
      setHasExecutorProfile(false);
      setCapabilityLoading(false);
      return;
    }

    const savedMode = localStorage.getItem(`activeMode:${user.id}`);

    setModeState(savedMode === "EXECUTOR" ? "EXECUTOR" : "REQUESTER");
    refreshExecutorCapability();
  }, [user?.id, isAdmin]);

  function setMode(newMode) {
    if (isAdmin) {
      return;
    }

    if (newMode !== "REQUESTER" && newMode !== "EXECUTOR") {
      return;
    }

    if (!user?.id) {
      return;
    }

    localStorage.setItem(`activeMode:${user.id}`, newMode);

    setModeState(newMode);
  }

  const isRequester = mode === "REQUESTER";

  const isExecutor = mode === "EXECUTOR";

  return (
    <ModeContext.Provider
      value={{
        mode,
        setMode,

        isAdmin,
        isRequester,
        isExecutor,
        hasExecutorProfile,
        capabilityLoading,
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

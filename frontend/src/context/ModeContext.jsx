import { createContext, useContext, useEffect, useState } from "react";

import { useAuth } from "./AuthContext.jsx";

const ModeContext = createContext(null);

export function ModeProvider({ children }) {
  const { user } = useAuth();

  const [mode, setModeState] = useState("REQUESTER");

  const isAdmin = user?.role === "ADMIN";

  useEffect(() => {
    if (!user?.id) {
      setModeState("REQUESTER");
      return;
    }

    if (isAdmin) {
      setModeState("ADMIN");
      return;
    }

    const savedMode = localStorage.getItem(`activeMode:${user.id}`);

    setModeState(savedMode === "EXECUTOR" ? "EXECUTOR" : "REQUESTER");
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

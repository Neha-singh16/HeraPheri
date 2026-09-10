import { createContext, useContext, useState } from "react";

const ModeContext = createContext(null);

export function ModeProvider({ children }) {
  const [mode, setModeState] = useState(() => {
    const savedMode = localStorage.getItem("activeMode");

    return savedMode || "REQUESTER";
  });

  function setMode(newMode) {
    if (newMode !== "REQUESTER" && newMode !== "EXECUTOR") {
      return;
    }

    localStorage.setItem("activeMode", newMode);

    setModeState(newMode);
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

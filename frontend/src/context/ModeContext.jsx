import { createContext, useContext, useEffect, useState } from "react";

import api from "../api/client.jsx";
import { useAuth } from "./AuthContext.jsx";

const ModeContext = createContext(null);

export function ModeProvider({ children }) {
  const { user } = useAuth();

  const [mode, setModeState] = useState("REQUESTER");
  const [hasExecutorProfile, setHasExecutorProfile] = useState(false);
  const [capabilityLoading, setCapabilityLoading] = useState(true);

  /*
    Keep mode separate for every user.

    Before:
      activeMode

    Now:
      activeMode:<userId>
  */
  useEffect(() => {
    if (!user?.id) {
      setModeState("REQUESTER");
      setHasExecutorProfile(false);
      setCapabilityLoading(false);
      return;
    }

    const storageKey = `activeMode:${user.id}`;
    const savedMode = localStorage.getItem(storageKey);

    setModeState(savedMode || "REQUESTER");
  }, [user?.id]);

  async function fetchExecutorCapability() {
    if (!user?.id) {
      setHasExecutorProfile(false);
      return false;
    }

    setCapabilityLoading(true);

    try {
      await api.get("/executor-profile");

      setHasExecutorProfile(true);

      return true;
    } catch (error) {
      if (error.response?.status === 404) {
        setHasExecutorProfile(false);

        // A user without an Executor profile can never stay
        // in Executor mode.
        setModeState("REQUESTER");

        localStorage.setItem(`activeMode:${user.id}`, "REQUESTER");

        return false;
      }

      console.error("Unable to check Executor capability:", error);

      return false;
    } finally {
      setCapabilityLoading(false);
    }
  }

  useEffect(() => {
    fetchExecutorCapability();
  }, [user?.id]);

  function setMode(newMode) {
    if (newMode !== "REQUESTER" && newMode !== "EXECUTOR") {
      return;
    }

    /*
      Executor mode is a capability, not just a UI preference.
    */
    if (newMode === "EXECUTOR" && !hasExecutorProfile) {
      return;
    }

    if (!user?.id) {
      return;
    }

    const storageKey = `activeMode:${user.id}`;

    localStorage.setItem(storageKey, newMode);
    setModeState(newMode);
  }

  async function refreshExecutorCapability() {
    return fetchExecutorCapability();
  }

  /*
    Safety:
    If the Executor profile disappears/revokes capability,
    immediately bring the user back to Requester mode.
  */
  useEffect(() => {
    if (
      !capabilityLoading &&
      !hasExecutorProfile &&
      mode === "EXECUTOR" &&
      user?.id
    ) {
      const storageKey = `activeMode:${user.id}`;

      localStorage.setItem(storageKey, "REQUESTER");
      setModeState("REQUESTER");
    }
  }, [capabilityLoading, hasExecutorProfile, mode, user?.id]);

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

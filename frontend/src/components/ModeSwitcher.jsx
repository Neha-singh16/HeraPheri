import { useMode } from "../context/ModeContext.jsx";

export default function ModeSwitcher() {
  const { mode, setMode, hasExecutorProfile, capabilityLoading } = useMode();

  return (
    <div className="mode-switcher">
      <button
        className={mode === "REQUESTER" ? "mode-button active" : "mode-button"}
        onClick={() => setMode("REQUESTER")}
      >
        Request
      </button>

      {hasExecutorProfile && !capabilityLoading && (
        <button
          className={mode === "EXECUTOR" ? "mode-button active" : "mode-button"}
          onClick={() => setMode("EXECUTOR")}
        >
          Execute
        </button>
      )}
    </div>
  );
}

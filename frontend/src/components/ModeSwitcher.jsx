import { useMode } from "../context/ModeContext.jsx";

export default function ModeSwitcher() {
  const { mode, setMode, hasExecutorProfile, checkingExecutor } = useMode();

  if (checkingExecutor) {
    return null;
  }

  return (
    <div className="mode-switcher">
      <button
        className={mode === "REQUESTER" ? "mode-button active" : "mode-button"}
        onClick={() => setMode("REQUESTER")}
      >
        Request
      </button>

      {hasExecutorProfile && (
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

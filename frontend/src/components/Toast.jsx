import { useEffect } from "react";

export default function Toast({
  message,
  onClose,
}) {
  useEffect(() => {
    if (!message) return;

    const timer = setTimeout(
      onClose,
      3500,
    );

    return () =>
      clearTimeout(timer);
  }, [message, onClose]);

  if (!message) return null;

  return (
    <div className="toast">
      <span>✓</span>
      <p>{message}</p>
    </div>
  );
}
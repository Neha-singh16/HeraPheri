export default function RealtimeStatus({
  connected,
}) {
  if (connected) {
    return null;
  }

  return (
    <div className="realtime-warning">
      <span />
      Reconnecting to HEREPHERI...
    </div>
  );
}
export default function PageError({
  title = "Something went wrong",
  message = "We couldn't load this page.",
  onRetry,
}) {
  return (
    <div className="page-state">
      <div className="page-state-icon">
        !
      </div>

      <h3>{title}</h3>

      <p>{message}</p>

      {onRetry && (
        <button
          className="secondary-button"
          onClick={onRetry}
        >
          Try again
        </button>
      )}
    </div>
  );
}
export function Skeleton({
  className = "",
}) {
  return (
    <div
      className={`skeleton ${className}`}
      aria-hidden="true"
    />
  );
}

export function DashboardSkeleton() {
  return (
    <div className="skeleton-page">
      <div className="skeleton-header">
        <Skeleton className="skeleton-eyebrow" />
        <Skeleton className="skeleton-title" />
        <Skeleton className="skeleton-text" />
      </div>

      <div className="skeleton-grid">
        <Skeleton className="skeleton-card" />
        <Skeleton className="skeleton-card" />
        <Skeleton className="skeleton-card" />
      </div>

      <Skeleton className="skeleton-large" />
    </div>
  );
}
/** A single shimmering placeholder block. */
export function Skeleton({
  className = '',
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return <div className={`animate-pulse rounded bg-white/[0.06] ${className}`} style={style} />;
}

/** Deterministic bar heights so the skeleton renders identically on server and client. */
const BAR_HEIGHTS = Array.from({ length: 32 }, (_, i) => 25 + ((i * 37) % 65));

/** Placeholder for the histogram while the first batch of logs loads. */
export function HistogramSkeleton() {
  return (
    <div className="flex h-[140px] items-end gap-1" data-testid="histogram-skeleton" aria-hidden>
      {BAR_HEIGHTS.map((h, i) => (
        <Skeleton key={i} className="flex-1" style={{ height: `${h}%` }} />
      ))}
    </div>
  );
}

/** Placeholder rows for the log list while the first batch loads. */
export function LogListSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <div className="divide-y divide-border/60" data-testid="log-list-skeleton" aria-hidden>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-3 py-2.5">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 flex-1" />
        </div>
      ))}
    </div>
  );
}

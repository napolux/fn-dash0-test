/** Short timezone label for the current locale (e.g. "GMT+2", "PDT"). */
function timeZoneAbbr(date: Date): string {
  const part = new Intl.DateTimeFormat('en-US', { timeZoneName: 'short' })
    .formatToParts(date)
    .find((p) => p.type === 'timeZoneName');
  return part?.value ?? '';
}

/**
 * Format epoch milliseconds as an absolute timestamp with millisecond precision and a
 * timezone label, so it's unambiguous (e.g. "Jul 06 12:00:00.123 GMT+2").
 */
export function formatTimestamp(ms: number): string {
  if (!ms) return '—';
  const date = new Date(ms);
  const day = date.toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
  const time = date.toLocaleTimeString('en-US', { hour12: false });
  const millis = String(date.getMilliseconds()).padStart(3, '0');
  return `${day} ${time}.${millis} ${timeZoneAbbr(date)}`.trimEnd();
}

/**
 * Format epoch milliseconds as a compact relative time ("just now", "12s ago",
 * "5m ago", "3h ago", "2d ago"), falling back to the absolute timestamp for anything
 * older than a week. `now` is injectable for deterministic tests.
 */
export function formatRelativeTime(ms: number, now: number = Date.now()): string {
  if (!ms) return '—';
  const seconds = Math.round((now - ms) / 1000);
  if (seconds < 5) return 'just now';
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return formatTimestamp(ms);
}

/** Compact clock label (HH:MM:SS) for dense axes. */
export function formatClock(ms: number): string {
  if (!ms) return '';
  return new Date(ms).toLocaleTimeString('en-US', { hour12: false });
}

/** Human-readable range, e.g. "12:00:01 – 12:00:04". */
export function formatRange(startMs: number, endMs: number): string {
  return `${formatClock(startMs)} – ${formatClock(endMs)}`;
}

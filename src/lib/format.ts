/** Format epoch milliseconds as an absolute timestamp with millisecond precision. */
export function formatTimestamp(ms: number): string {
  if (!ms) return '—';
  const date = new Date(ms);
  const time = date.toLocaleTimeString('en-US', { hour12: false });
  const millis = String(date.getMilliseconds()).padStart(3, '0');
  const day = date.toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
  return `${day} ${time}.${millis}`;
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

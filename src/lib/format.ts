import { format, formatDistanceToNowStrict } from 'date-fns';

/**
 * Format epoch milliseconds as an absolute timestamp with millisecond precision and a
 * timezone label (e.g. "Jul 06 12:00:00.123 GMT+2").
 */
export function formatTimestamp(ms: number): string {
  if (!ms) return '—';
  return format(new Date(ms), 'MMM dd HH:mm:ss.SSS O');
}

/** Format epoch milliseconds as a relative time (e.g. "12 seconds ago"). */
export function formatRelativeTime(ms: number): string {
  if (!ms) return '—';
  return formatDistanceToNowStrict(new Date(ms), { addSuffix: true });
}

/** Compact clock label (HH:MM:SS) for dense axes. */
export function formatClock(ms: number): string {
  if (!ms) return '';
  return format(new Date(ms), 'HH:mm:ss');
}

/** Human-readable range, e.g. "12:00:01 – 12:00:04". */
export function formatRange(startMs: number, endMs: number): string {
  return `${formatClock(startMs)} – ${formatClock(endMs)}`;
}

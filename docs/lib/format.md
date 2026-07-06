# Date & time formatting

**File:** `src/lib/format.ts`

## Purpose

Thin presentational helpers for turning epoch milliseconds into display strings. The actual formatting is delegated to [date-fns](https://date-fns.org); these wrappers just add the app's missing-value guards and a consistent style.

## Exports

- **`formatTimestamp(ms)`** — absolute timestamp with millisecond precision and a timezone label (e.g. "Jul 06 12:00:00.123 GMT+2"). Returns `—` for a missing timestamp.
- **`formatRelativeTime(ms)`** — relative time via `formatDistanceToNowStrict` (e.g. "12 seconds ago"). Returns `—` for a missing timestamp.
- **`formatClock(ms)`** — compact `HH:MM:SS` label for dense axes. Returns `''` for a missing timestamp.
- **`formatRange(startMs, endMs)`** — two clock labels joined by an en dash, for the histogram tooltip.

## Testing

`src/lib/__tests__/format.test.ts` covers only our own logic — the missing-value guards and the range joiner. The date-fns formatting itself is not re-tested.

## Related

- [`LogTable`](../components/log-table.md) — Time column (relative + absolute on hover).
- [`LogDetails`](../components/log-details.md) — absolute timestamp in record metadata.
- [`Histogram`](../components/histogram-chart.md) — axis and tooltip clock labels.

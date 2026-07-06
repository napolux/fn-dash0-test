# Skeletons

**File:** `src/components/Skeleton.tsx`

## Purpose

Shimmering placeholders shown during the **initial** load, so the first paint has structure instead of a "Loading…" string.

## Exports

- **`Skeleton`** — a single pulsing block; takes `className` and `style`.
- **`LogListSkeleton`** — `rows` placeholder log rows (default 8), each mimicking the Severity/Time/Body columns.
- **`HistogramSkeleton`** — a row of bars filling the histogram's height.

## Behavior

- Bar heights are **deterministic** (a fixed pattern, not random) so the markup renders identically on the server and client and doesn't cause a hydration mismatch.
- Marked `aria-hidden` and carry `data-testid`s (`log-list-skeleton`, `histogram-skeleton`) for tests.
- Only shown on the first load; see [`LogViewer` → States](./log-viewer.md#states) for why a refresh keeps the existing list instead.

## Testing

`src/components/__tests__/Skeleton.test.tsx` covers row counts (custom + default) and the histogram skeleton; `LogViewer.test.tsx` asserts both appear during the initial load.

## Related

- [`LogViewer`](./log-viewer.md) — renders them while `loading` with no logs yet.

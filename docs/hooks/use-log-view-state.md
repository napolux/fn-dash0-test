# `useLogViewState`

**File:** `src/hooks/useLogViewState.ts`

## Purpose

The **single owner** of the log view's state (view mode + active filters), backed by the **URL query string** so views are shareable and survive reloads. Components read and mutate view state only through this hook, never touching the URL directly.

## API

```ts
const { state, update, setViewMode } = useLogViewState();
```

| Field | Type | Notes |
| --- | --- | --- |
| `state` | [`LogViewState`](../lib/view-state.md) | derived from the URL |
| `update` | `(patch: Partial<LogViewState>) => void` | merge a partial update |
| `setViewMode` | `(mode: ViewMode) => void` | convenience for the toggle |

## How it works

- Reads the URL via `useSearchParams()` and derives `state` with [`parseViewState`](../lib/view-state.md) (memoized on the params).
- Mutations serialize the next state with [`serializeViewState`](../lib/view-state.md) and push it with `router.replace(pathname + '?' + query, { scroll: false })` — no history spam, no scroll jump. An empty query drops the `?` entirely.

Because `useSearchParams` requires it, any consumer must render inside a `<Suspense>` boundary — [`LogViewer`](../components/log-viewer.md) is wrapped in one in `app/page.tsx`.

## Testing

`src/hooks/__tests__/useLogViewState.test.ts` mocks `next/navigation` and covers: default (empty URL) state, deriving state from the query string, `setViewMode`/`update` writing serialized params via `router.replace`, and dropping the query when returning to defaults.

## Related

- [View state & URL contract](../lib/view-state.md) — the state shape + serialization.
- [`Toolbar`](../components/toolbar.md) (view toggle) and [`Histogram`](../components/histogram-chart.md) (severity legend) — the mutators.
- [`LogViewer`](../components/log-viewer.md) — owns the hook instance.

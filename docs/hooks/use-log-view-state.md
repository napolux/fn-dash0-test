# `useLogViewState`

**File:** `src/hooks/useLogViewState.ts`

## Purpose

The **single owner** of the log view's state (which view mode is active, and — in future — which filters). Components read and mutate view state only through this hook, never touching the URL directly.

## API

```ts
const { state, update, setViewMode } = useLogViewState(initial = DEFAULT_VIEW_STATE);
```

| Field | Type | Notes |
| --- | --- | --- |
| `state` | [`LogViewState`](../lib/view-state.md) | current view/filter state |
| `update` | `(patch: Partial<LogViewState>) => void` | merge a partial update |
| `setViewMode` | `(mode: ViewMode) => void` | convenience for the toggle |

## Why it exists (the seam)

Today the state lives in React `useState`. Because every component depends on *this hook* rather than on the URL, making the state URL-addressable later is a **one-file change**: swap the internals to `useSearchParams()` (seeded via `parseViewState`) + `router.replace(pathname + '?' + serializeViewState(next))`. No caller changes.

The (de)serialization contract those internals would use already exists and is tested — see [View state & URL contract](../lib/view-state.md).

## Related

- [View state & URL contract](../lib/view-state.md) — the state shape + serialization.
- [`Toolbar`](../components/toolbar.md) — calls `setViewMode`.
- [`LogViewer`](../components/log-viewer.md) — owns the hook instance.

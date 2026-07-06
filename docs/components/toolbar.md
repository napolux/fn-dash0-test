# `Toolbar`

**File:** `src/components/Toolbar.tsx`

## Purpose

The controls row above the log list: the flat/grouped **view toggle**, a record count, and a **refresh** action.

## Props

```ts
interface ToolbarProps {
  viewMode: 'flat' | 'grouped';
  onViewModeChange: (mode: ViewMode) => void;
  onRefresh: () => void;
  loading: boolean;
  count: number;
}
```

## Behavior

- The toggle is a segmented `role="tablist"` with two tabs (`Flat list`, `Group by service`); the active tab uses `aria-selected`.
- The refresh button is disabled while `loading` and shows a spinning icon.
- `count` is the number of currently displayed records.

Purely presentational — state lives in [`useLogViewState`](../hooks/use-log-view-state.md), owned by [`LogViewer`](./log-viewer.md).

## Related

- [`LogViewer`](./log-viewer.md) — passes props and handlers.
- [View state](../lib/view-state.md) — the `ViewMode` type.

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
  count: number; // records shown (after filtering)
  total: number; // records before filtering
}
```

## Behavior

- The toggle is a segmented `role="tablist"` with two tabs (`Flat list`, `Group by service`); the active tab uses `aria-selected`.
- The refresh button is disabled while `loading` and shows a spinning icon.
- The record count reads "`N` records" normally, and switches to a highlighted "`N` of `M` records" whenever a filter is active (`count !== total`), so it's obvious the view is filtered.

Purely presentational — state lives in [`useLogViewState`](../hooks/use-log-view-state.md), owned by [`LogViewer`](./log-viewer.md).

## Testing

`src/components/__tests__/Toolbar.test.tsx` covers the tab emitting the view mode, the record count, and refresh disabled while loading.

## Related

- [`LogViewer`](./log-viewer.md) — passes props and handlers.
- [View state](../lib/view-state.md) — the `ViewMode` type.

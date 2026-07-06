# `LogViewer`

**File:** `src/components/LogViewer.tsx`

## Purpose

The top-level **client container**. It owns the data and view state and composes the whole viewer; every other component is presentational and driven by props.

## Responsibilities

- Calls [`useLogs`](../hooks/use-logs.md) for `{ logs, loading, error, refetch }`.
- Calls [`useLogViewState`](../hooks/use-log-view-state.md) for `{ state, setViewMode, update }`.
- Derives the displayed records via [`selectLogs(logs, state)`](../lib/view-state.md), and provides the severity-toggle handler (via [`toggleSeverity`](../lib/view-state.md)).
- Renders, top to bottom: a header, the [`Histogram`](./histogram-chart.md) card, the [`Toolbar`](./toolbar.md), and a card containing either the [`LogTable`](./log-table.md) (flat) or the [`GroupedLogView`](./grouped-log-view.md).
- Passes the **unfiltered** logs to the histogram (so its legend stays a stable filter control) and the **filtered** logs to the list + count.

> Rendered inside a `<Suspense>` boundary in `app/page.tsx`, required because [`useLogViewState`](../hooks/use-log-view-state.md) reads `useSearchParams`.

## States

The list card resolves to one of four distinct states, so users always know *why* it's empty:

- **Error** — the fetch failed; shows the message and a "Try again" button wired to `refetch`.
- **Initial loading** — [skeleton](./skeleton.md) rows and a skeleton histogram, shown only when there are no logs yet. A refresh keeps the current list mounted (it doesn't fall back to skeletons), so scroll position is preserved and the screen never blanks.
- **No data** — the request succeeded but returned zero records; [`EmptyState`](./empty-state.md) "No logs to show" with a Refresh action.
- **Filtered-empty** — logs exist but none match the active severity filter; [`EmptyState`](./empty-state.md) "No logs match the active filter" with a Clear-filter action (`update({ severity: undefined })`).
- **Loaded** — the full list; the card scrolls within a max height.

## Related

- Hooks: [`useLogs`](../hooks/use-logs.md), [`useLogViewState`](../hooks/use-log-view-state.md)
- Children: [`Toolbar`](./toolbar.md), [`Histogram`](./histogram-chart.md), [`LogTable`](./log-table.md), [`GroupedLogView`](./grouped-log-view.md), [`EmptyState`](./empty-state.md)

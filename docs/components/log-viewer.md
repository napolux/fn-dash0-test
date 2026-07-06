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

- **Error** — shows the message and a "Try again" button wired to `refetch`.
- **Initial loading** — placeholder text in the histogram and list cards (only when there are no logs yet, so refreshes don't blank the screen).
- **Loaded** — the full UI; the list card scrolls within a max height.

## Related

- Hooks: [`useLogs`](../hooks/use-logs.md), [`useLogViewState`](../hooks/use-log-view-state.md)
- Children: [`Toolbar`](./toolbar.md), [`Histogram`](./histogram-chart.md), [`LogTable`](./log-table.md), [`GroupedLogView`](./grouped-log-view.md)

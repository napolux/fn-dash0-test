# OTLP Log Viewer — Documentation

Developer documentation for the OTLP Log Viewer. Start with the [Application overview](./overview.md) for the big picture, then dive into the per-part docs below.

Each doc follows the same shape: **purpose → responsibilities → API/behavior → related**. Docs are organized to mirror the `src/` tree.

## Index

### Overview

- [Application overview](./overview.md) — what the app is, the stack, architecture, data flow, key decisions, and the roadmap.

### Data & transforms (`src/lib`, `src/types`)

- [OTLP types & data model](./types/otlp-types.md) — the hand-written protobuf-JSON types and the flattened `FlatLogRecord`.
- [OTLP transforms](./lib/otlp-transforms.md) — flattening the nested envelope, `AnyValue` conversion, timestamps.
- [Severity](./lib/severity.md) — `severityNumber` → group mapping and shared colors.
- [Histogram bucketing](./lib/histogram.md) — pure time-bucketing of records.
- [Grouping](./lib/grouping.md) — grouping records by parent resource (service).
- [View state & URL contract](./lib/view-state.md) — the serializable view state and future URL-addressable filters.

### Hooks (`src/hooks`)

- [`useLogs`](./hooks/use-logs.md) — fetch, flatten, and manage log loading/error state.
- [`useLogViewState`](./hooks/use-log-view-state.md) — single owner of view/filter state.

### API (`src/app/api`)

- [Logs proxy route](./api/logs-proxy.md) — server-side proxy to the upstream OTLP endpoint.

### Components (`src/components`)

- [`LogViewer`](./components/log-viewer.md) — top-level container that composes the viewer.
- [`Toolbar`](./components/toolbar.md) — view toggle, record count, refresh.
- [`Histogram`](./components/histogram-chart.md) — the severity-stacked bar chart.
- [`LogTable`](./components/log-table.md) — the expandable flat log table.
- [`LogDetails`](./components/log-details.md) — the expanded-row detail panel.
- [`GroupedLogView`](./components/grouped-log-view.md) — collapsible per-service sections.
- [`SeverityBadge`](./components/severity-badge.md) — the color-coded severity pill.
- [`EmptyState`](./components/empty-state.md) — reusable empty-view message + action.

---

For build/run/test instructions, see the [root README](../README.md).

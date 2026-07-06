# Application overview

The OTLP Log Viewer is a web app for exploring [OpenTelemetry log records](https://opentelemetry.io/docs/concepts/signals/logs/). It fetches OTLP logs from a backend, flattens the nested protobuf-JSON envelope into a display-ready shape, and presents three views engineers reach for constantly: a scannable **list**, a **histogram** of volume over time, and a **group-by-service** breakdown.

## Goals

- Let engineers **scan** logs quickly (severity, time, body at a glance).
- Let them **drill in** to any record's full attributes and resource/scope metadata.
- Show **distribution over time** so spikes and gaps are obvious.
- Let them **pivot** between a flat stream and a per-service grouping.

## Stack

| Concern | Choice |
| --- | --- |
| Framework | Next.js (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS (fixed dark theme) |
| Table | TanStack Table (headless) |
| Charts | Recharts |
| Dates | date-fns |
| Tests | Vitest + Testing Library |

## Architecture at a glance

```
Browser
  └─ LogViewer (client)
       ├─ useLogs ─────────► GET /api/logs (Next route handler)
       │                          └─► upstream OTLP endpoint
       ├─ useLogViewState (view/filter state)
       ├─ Histogram          (buildHistogram)
       └─ LogTable / GroupedLogView
              └─ LogDetails
```

Three layers:

1. **Data layer** (`src/lib`, `src/types`) — pure, framework-free functions that model and transform OTLP data. This is the most heavily tested part. See [transforms](./lib/otlp-transforms.md), [histogram](./lib/histogram.md), [grouping](./lib/grouping.md), [view state](./lib/view-state.md).
2. **Data-access layer** (`src/app/api`, `src/hooks`) — a server-side [proxy](./api/logs-proxy.md) plus the [`useLogs`](./hooks/use-logs.md) and [`useLogViewState`](./hooks/use-log-view-state.md) hooks.
3. **Presentation layer** (`src/components`) — the [`LogViewer`](./components/log-viewer.md) container and its children.

## Data flow

1. [`/api/logs`](./api/logs-proxy.md) proxies the upstream OTLP endpoint (CORS-safe, mockable).
2. [`useLogs`](./hooks/use-logs.md) fetches that route and runs `flattenLogs`.
3. [`flattenLogs`](./lib/otlp-transforms.md) walks `resourceLogs → scopeLogs → logRecords`, carrying resource + scope context onto each record and sorting newest-first.
4. [`LogViewer`](./components/log-viewer.md) derives the displayed records via `selectLogs` and renders the histogram, toolbar, and the flat or grouped table.

## Key decisions

- **Headless table (TanStack)** — native expandable rows with full control over markup, so the UI isn't fighting library styles.
- **Custom fetch hook over a data library** — the fetch/transform/state logic stays explicit and directly unit-testable, which is the core of the exercise.
- **Server-side proxy** — avoids browser CORS, hides the upstream URL, and gives a single seam to mock in tests.
- **Hand-written OTLP types** — a small, precise subset of exactly what the API returns, rather than protobuf codegen.
- **Normalized severity** — `severityNumber` maps to a stable [severity group](./lib/severity.md) so colors/grouping work even when `severityText` is missing.

## Testing

Vitest + Testing Library, focused on the data core and hooks. See each part's doc for its test coverage, and the [root README](../README.md#testing) for the file map.

## Filtering & URL-addressable state

View state — view mode plus the **severity** filter — lives entirely in the URL query string, so any view is shareable and reload-safe. The [`Histogram`](./components/histogram-chart.md) legend toggles severities, flowing through [`useLogViewState`](./hooks/use-log-view-state.md) → the URL → [`selectLogs`](./lib/view-state.md).

**Next filters:** `service`, and a time range (`from`/`to`) — already reserved in the [state contract](./lib/view-state.md) and round-tripping through the URL, so they slot into `selectLogs` without re-plumbing.

# OTLP Log Viewer

A web app for visualizing [OpenTelemetry (OTLP) log records](https://opentelemetry.io/docs/concepts/signals/logs/). Engineers can scan logs in a table, drill into per-record attributes, see how log volume is distributed over time, and switch between a flat list and a service-grouped view.

Built with **Next.js (App Router) · React · TypeScript · Tailwind CSS**, tested with **Vitest**.

> 🚀 **Live demo:** https://fn-dash0-test-git-main-fnapoletano.vercel.app (deployed on Vercel)
>
> 📚 **In-depth documentation** lives in [`docs/`](./docs/README.md) — an application overview plus a page per component, hook, and data module.

## Features

- **Log list** — a table of Severity / Time / Body. Any row expands to reveal the full body plus every log, resource, and scope attribute.
- **Histogram** — log volume over time as a severity-stacked bar chart (X: time, Y: count) with a per-bucket breakdown tooltip.
- **Group by service** — a toggle that flips between a flat list and a view grouped by parent resource (service), with collapsible sections.

## Getting started

Requires Node ≥ 18 and [pnpm](https://pnpm.io) (swap in `npm`/`yarn` if you prefer).

```bash
pnpm install
pnpm dev        # http://localhost:3000
```

Other scripts:

```bash
pnpm test           # run the Vitest suite once
pnpm test:watch     # watch mode
pnpm test:coverage  # coverage report
pnpm lint           # ESLint
pnpm build          # production build
```

The upstream API URL can be overridden with the `OTLP_LOGS_API_URL` environment variable (defaults to the take-home endpoint).

## Architecture

```
src/
  app/
    page.tsx                 # renders <LogViewer/>
    api/logs/route.ts        # server-side proxy → upstream OTLP endpoint (CORS-safe)
  components/
    LogViewer.tsx            # top-level container: owns data + view state
    Toolbar.tsx              # flat/grouped toggle, record count, refresh
    Histogram.tsx            # Recharts severity-stacked bar chart
    LogTable.tsx             # TanStack Table: Severity | Time | Body + expandable rows
    LogDetails.tsx           # expanded-row content: body + all attributes/metadata
    GroupedLogView.tsx       # collapsible per-service sections (reuses LogTable)
    SeverityBadge.tsx        # color-coded severity pill
  hooks/
    useLogs.ts               # fetch /api/logs, flatten, expose {logs, loading, error, refetch}
    useLogViewState.ts       # single owner of view/filter state (URL-swappable seam)
  lib/
    otlp.ts                  # flattenLogs(), anyValueToJs/String(), severity mapping
    histogram.ts             # buildHistogram() — time bucketing
    grouping.ts              # groupByResource()
    viewState.ts             # LogViewState + (de)serialization + selectLogs()
    severity.ts              # severity ordering + colors (shared by chart & badge)
    format.ts                # timestamp formatting
  types/otlp.ts              # hand-written OTLP protobuf-JSON types + FlatLogRecord
```

### Data flow

1. `app/api/logs/route.ts` proxies the upstream OTLP endpoint. Fetching server-side avoids browser CORS, hides the upstream URL, and gives one seam to mock in tests.
2. `useLogs` fetches `/api/logs`, runs `flattenLogs`, and manages loading/error state (aborting in-flight requests on unmount or refetch).
3. `flattenLogs` walks the nested envelope (`resourceLogs → scopeLogs → logRecords`), carrying resource + scope context onto each record and sorting newest-first.
4. `LogViewer` derives the displayed records via `selectLogs` and renders the histogram, toolbar, and the flat or grouped table.

### Handling nested OTLP types

- **`AnyValue`** is a tagged union. `anyValueToJs` reads whichever field is set and recurses into `arrayValue` / `kvlistValue`; `anyValueToString` renders values for display (JSON for structured ones). 64-bit ints arrive as either numbers or strings in protobuf-JSON — they're normalized to a number only when it fits safely in a double, otherwise the string is kept to avoid precision loss.
- **Severity** is normalized: OTLP `severityNumber` (1–24, in four-step bands) maps to a `SeverityGroup` (`TRACE`…`FATAL`), so coloring and grouping stay consistent even when `severityText` is missing or non-standard.
- **Timestamps** (`timeUnixNano`, nanoseconds) convert to integer epoch milliseconds via `BigInt` division to avoid the precision loss of `Number()` on ~1e18 values.

## Key decisions

- **TanStack Table** (headless) for the list — native expandable rows and full control over markup, so the UI isn't fighting a component library's styling.
- **Recharts** for the histogram — declarative and quick to style; time bucketing is done by our own pure `buildHistogram` rather than the library.
- **Custom `useLogs` hook** over a data-fetching library — keeps the fetch/transform/state logic explicit and directly unit-testable, which is the heart of the exercise.
- **Server-side proxy** rather than fetching the upstream from the browser — CORS-safe and mockable.
- **Hand-written OTLP types** instead of protobuf codegen — a small, precise subset of exactly what the API returns.

### URL-addressable filters (designed, not yet implemented)

Filters aren't built yet, but the app is structured so they can be added to the page URL without re-plumbing:

- All view/filter state lives in one serializable `LogViewState` (only primitives, so it round-trips through `URLSearchParams`). `viewMode` is wired today; `severity` / `service` / `search` / `from` / `to` are reserved.
- `useLogViewState` is the **only** owner of that state — no component touches the URL directly. Swapping its internals to `useSearchParams()` + `router.replace()` is a one-file change.
- `serializeViewState` / `parseViewState` (in `lib/viewState.ts`) already lock the URL contract and are unit-tested.
- `selectLogs(records, state)` is the single seam where filtering will live (a pass-through today).

## Testing

Vitest + Testing Library. Coverage focuses on the data-transformation core and the hooks:

- `lib/__tests__/otlp.test.ts` — `AnyValue` conversion (all variants, nested, string ints), `flattenLogs`, severity/timestamp mapping, and a smoke test over a real captured API response (`src/lib/__tests__/logs.sample.json`).
- `lib/__tests__/histogram.test.ts` — bucket count/boundaries, empty and zero-span inputs, per-severity tallies.
- `lib/__tests__/grouping.test.ts` — grouping by resource, counts, namespace disambiguation.
- `lib/__tests__/viewState.test.ts` — URL (de)serialization round-trips.
- `hooks/__tests__/useLogs.test.ts` — success/error/refetch/abort with a mocked `fetch`.
- `components/__tests__/LogTable.test.tsx`, `components/__tests__/LogViewer.test.tsx` — row expansion reveals attributes; the toggle switches flat ↔ grouped.

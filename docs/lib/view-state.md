# View state & URL contract

**File:** `src/lib/viewState.ts`

## Purpose

Define the complete, **serializable** state of the log view, the contract for turning it into (and out of) URL search params, and the filtering it drives. The view state lives in the URL, so views are shareable and survive reloads.

## The state shape

```ts
interface LogViewState {
  viewMode: 'flat' | 'grouped';
  severity?: SeverityGroup[]; // inclusion filter (empty/undefined = all)
  service?: string;           // reserved (not yet wired)
  from?: number;              // reserved, epoch ms
  to?: number;                // reserved, epoch ms
}
```

Every field is a primitive (or array of primitives) so the whole object round-trips cleanly through `URLSearchParams`. `viewMode` and `severity` are wired to the UI today; `service`/`from`/`to` are reserved for the next filters and already round-trip.

`DEFAULT_VIEW_STATE` is `{ viewMode: 'flat' }`.

## Exports

- **`serializeViewState(state): URLSearchParams`** — omits anything at its default, so the URL stays clean. Param names: `view`, `severity` (CSV), `service`, `from`, `to`.
- **`parseViewState(params): LogViewState`** — inverse; ignores unknown/invalid values and drops invalid severities.
- **`selectLogs(records, state): FlatLogRecord[]`** — the single filtering seam. Applies the active `severity` (inclusion) filter. Returns the input array **unchanged** when no filter is active. The reserved fields slot in here later without touching callers.
- **`toggleSeverity(selected, group): SeverityGroup[] | undefined`** — pure helper for the [histogram legend](../components/histogram-chart.md): toggles a group in the inclusion set, returning `undefined` when the set becomes empty (so the state/URL stay clean).

## How the pieces fit

- [`useLogViewState`](../hooks/use-log-view-state.md) derives `LogViewState` from the URL via `parseViewState` and writes changes back with `serializeViewState` — it is the only mutator; no component touches the URL directly.
- [`LogViewer`](../components/log-viewer.md) calls `selectLogs(logs, state)` to derive the list, and uses `toggleSeverity` to handle legend clicks.

## Testing

`src/lib/__tests__/viewState.test.ts` covers default omission, round-trips (view mode + reserved fields), invalid-param fallbacks, `selectLogs` severity filtering (including empty-set and no-op pass-through), and `toggleSeverity` (add/append/remove/empty + URL round-trip).

## Related

- [`useLogViewState`](../hooks/use-log-view-state.md) · [`LogViewer`](../components/log-viewer.md) · [`Histogram`](../components/histogram-chart.md)
- [Application overview → Roadmap](../overview.md#roadmap-url-addressable-filters)

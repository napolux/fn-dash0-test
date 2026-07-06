# View state & URL contract

**File:** `src/lib/viewState.ts`

## Purpose

Define the complete, **serializable** state of the log view and the contract for turning it into (and out of) URL search params. This is the groundwork that makes future **URL-addressable filters** a drop-in — no filters are implemented yet.

## The state shape

```ts
interface LogViewState {
  viewMode: 'flat' | 'grouped';
  // reserved for future URL-addressable filters (not yet applied):
  severity?: SeverityGroup[];
  service?: string;
  from?: number; // epoch ms
  to?: number;   // epoch ms
}
```

Every field is a primitive (or array of primitives) so the whole object round-trips cleanly through `URLSearchParams`. Today only `viewMode` is wired to the UI; the rest are reserved.

`DEFAULT_VIEW_STATE` is `{ viewMode: 'flat' }`.

## Exports

- **`serializeViewState(state): URLSearchParams`** — omits anything at its default, so the URL stays clean. Param names: `view`, `severity` (CSV), `service`, `q`, `from`, `to`.
- **`parseViewState(params): LogViewState`** — inverse; ignores unknown/invalid values and drops invalid severities.
- **`selectLogs(records, state): FlatLogRecord[]`** — the single seam where filtering will live. **Today it is a pass-through**; reserved fields slot in here without touching callers.

## How the pieces fit

- [`useLogViewState`](../hooks/use-log-view-state.md) owns a `LogViewState` and is the only mutator. Swapping its internals to read/write the URL uses exactly `parseViewState` / `serializeViewState` — which is why they're tested now, ahead of the UI.
- [`LogViewer`](../components/log-viewer.md) calls `selectLogs(logs, state)` to derive what's shown.

## Testing

`src/lib/__tests__/viewState.test.ts` covers default omission, view-mode round-trip, full reserved-field round-trip, invalid-param fallbacks, and the `selectLogs` pass-through.

## Related

- [`useLogViewState`](../hooks/use-log-view-state.md) · [`LogViewer`](../components/log-viewer.md)
- [Application overview → Roadmap](../overview.md#roadmap-url-addressable-filters)

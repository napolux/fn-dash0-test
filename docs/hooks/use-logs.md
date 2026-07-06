# `useLogs`

**File:** `src/hooks/useLogs.ts`

## Purpose

Fetch OTLP logs from the [proxy route](../api/logs-proxy.md), flatten them into display-ready [`FlatLogRecord`](../types/otlp-types.md)s, and expose loading/error state to the UI.

## API

```ts
const { logs, loading, error, refetch } = useLogs(endpoint = '/api/logs');
```

| Field | Type | Notes |
| --- | --- | --- |
| `logs` | `FlatLogRecord[]` | flattened + sorted newest-first |
| `loading` | `boolean` | `true` while a request is in flight |
| `error` | `string \| null` | message on failure, else `null` |
| `refetch` | `() => void` | re-run the fetch on demand |

The `endpoint` argument is injectable so tests (and future variants) can point it elsewhere.

## Behavior

- Fetches on mount and whenever `refetch` is called.
- **Aborts in-flight requests** on unmount and whenever a newer fetch starts, via an `AbortController` held in a ref. This guarantees a slow response can never overwrite fresher data, and avoids setting state after unmount.
- Delegates all shape work to [`flattenLogs`](../lib/otlp-transforms.md); the hook itself only orchestrates fetch + state.

## Testing

`src/hooks/__tests__/useLogs.test.ts` mocks `fetch` and covers: success → flattened logs, non-OK response → error, rejected fetch → error, `refetch` triggers a second call, and abort-on-unmount.

## Related

- [Logs proxy route](../api/logs-proxy.md) — the endpoint it calls.
- [OTLP transforms](../lib/otlp-transforms.md) — `flattenLogs`.
- [`LogViewer`](../components/log-viewer.md) — the consumer.

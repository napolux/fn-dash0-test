# Logs proxy route

**File:** `src/app/api/logs/route.ts`

## Purpose

A server-side [Route Handler](https://nextjs.org/docs/app/building-your-application/routing/route-handlers) that proxies the upstream OTLP logs endpoint. The client never calls the upstream directly.

## Why a proxy

- **CORS-safe** — the browser talks only to the same-origin `/api/logs`.
- **Hides the upstream URL** and centralizes it in one place.
- **Mockable seam** — [`useLogs`](../hooks/use-logs.md) fetches a same-origin path that tests can stub.

## Behavior

- `GET /api/logs` fetches the upstream and returns its JSON unchanged.
- The upstream generates fresh random data per request, so the route is `export const dynamic = 'force-dynamic'` and fetches with `cache: 'no-store'`. The response also carries `cache-control: no-store`.
- On a non-OK upstream response or a network failure it returns **502** with `{ error }`, which [`useLogs`](../hooks/use-logs.md) surfaces as an error state.

## Configuration

| Env var | Default |
| --- | --- |
| `OTLP_LOGS_API_URL` | the take-home endpoint (`…/api/v2/logs`) |

Set `OTLP_LOGS_API_URL` to point the proxy at a different backend.

## Related

- [`useLogs`](../hooks/use-logs.md) — the client consumer.
- [Application overview](../overview.md#data-flow).

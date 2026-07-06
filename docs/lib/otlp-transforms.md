# OTLP transforms

**File:** `src/lib/otlp.ts`

## Purpose

The pure, framework-free core that turns the nested OTLP envelope into the flat, display-ready [`FlatLogRecord`](../types/otlp-types.md) list. This is the most heavily tested module in the app.

## Exports

### `flattenLogs(response): FlatLogRecord[]`

Walks `resourceLogs → scopeLogs → logRecords`, carrying resource and scope context onto every record. Each record gets a stable `id` (`resourceIndex-scopeIndex-recordIndex`). Returns records **sorted newest-first** by `timestampMs`. Tolerant of missing levels — returns `[]` for empty/`undefined` input.

### `anyValueToJs(value): unknown`

Reads whichever field of an [`IAnyValue`](../types/otlp-types.md) union is set and recurses into `arrayValue` / `kvlistValue`. Returns `undefined` for empty/absent values.

- **64-bit ints:** `intValue` may arrive as a number or a string. It is converted to a number **only when the result is a safe integer**; otherwise the original string is kept, to avoid precision loss on values beyond `Number.MAX_SAFE_INTEGER`.

### `anyValueToString(value): string`

Renders an `AnyValue` for display — strings pass through, structured values are JSON-encoded, empty is `''`.

### `flattenAttributes(attributes): FlatAttribute[]`

Maps raw `IKeyValue[]` into display-ready `{ key, value }` string pairs.

### `severityGroup(n): SeverityGroup`

Maps an OTLP `severityNumber` to a normalized band. See [Severity](./severity.md).

### `unixNanoToMillis(timeUnixNano): number`

Converts a nanosecond epoch **string** to integer epoch milliseconds using `BigInt` division — `Number()` on ~1e18 values loses precision. Falls back gracefully to `0` on missing/invalid input.

## Notes

- `service.name` falls back to `unknown_service` when absent (matching OTEL convention).
- `severityText` falls back to the derived group label when the record omits it.

## Testing

`src/lib/__tests__/otlp.test.ts` covers every `AnyValue` variant (including nested and string-encoded ints), attribute flattening, the full severity table, timestamp conversion, `flattenLogs` structure/sorting/fallbacks, and a smoke test over a real captured API response (`logs.sample.json`).

## Related

- [OTLP types & data model](../types/otlp-types.md)
- [Severity](./severity.md) · [Grouping](./grouping.md) · [Histogram](./histogram.md)

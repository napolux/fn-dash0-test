# `LogDetails`

**File:** `src/components/LogDetails.tsx`

## Purpose

The expanded-row detail panel for a single record: the full body plus **every** attribute and the resource/scope metadata.

## Props

```ts
interface LogDetailsProps {
  record: FlatLogRecord;
}
```

## Behavior

- **Body** — rendered in a scrollable `<pre>`. If the body looks like JSON it is pretty-printed (parsed and re-stringified with indentation); otherwise shown verbatim.
- **Log attributes** — a key/value grid of `record.attributes`; shows an italic "No attributes" when empty.
- **Resource** — the parent service's attributes (`record.resource.attributes`), headed by the service name.
- **Record metadata** — derived fields: formatted timestamp, `severityNumber`, `severityText`, and scope name/version when present.

Presentational; receives one already-flattened [`FlatLogRecord`](../types/otlp-types.md).

## Related

- [`LogTable`](./log-table.md) — renders this in the expanded row.
- [OTLP types & data model](../types/otlp-types.md)

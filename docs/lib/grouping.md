# Grouping

**File:** `src/lib/grouping.ts`

## Purpose

Group flattened records by their **parent resource** (service) for the [`GroupedLogView`](../components/grouped-log-view.md).

## API

```ts
groupByResource(records: FlatLogRecord[]): ServiceGroup[]
```

```ts
interface ServiceGroup {
  key: string;            // stable resource key: `${namespace}/${serviceName}`
  serviceName: string;
  serviceNamespace?: string;
  serviceVersion?: string;
  count: number;
  records: FlatLogRecord[];
}
```

## Behavior

- Groups on `record.resource.key` (a composite of namespace + service name), so the **same service name in different namespaces** stays separate.
- Preserves incoming record order **within** each group (records arrive newest-first from [`flattenLogs`](./otlp-transforms.md)).
- Returns groups **sorted by `count` descending**, so the noisiest services surface first.

## Testing

`src/lib/__tests__/grouping.test.ts` covers empty input, multi-record grouping, count-descending order, and namespace disambiguation.

## Related

- [`GroupedLogView`](../components/grouped-log-view.md) — the renderer.
- [OTLP transforms](./otlp-transforms.md) — where `resource.key` is built.

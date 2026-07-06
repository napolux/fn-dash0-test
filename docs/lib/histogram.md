# Histogram bucketing

**File:** `src/lib/histogram.ts`

## Purpose

Pure time-bucketing of records for the [`Histogram`](../components/histogram-chart.md) component. All the math lives here; the component only renders the result.

## API

```ts
buildHistogram(records: FlatLogRecord[], bucketCount = 40): HistogramBucket[]
```

```ts
interface HistogramBucket {
  startMs: number;
  endMs: number;
  total: number;
  counts: Record<SeverityGroup, number>; // per-severity, enables stacked bars
}
```

## Behavior

- Spans the min→max `timestampMs` across the records, divided into `bucketCount` evenly spaced bins.
- Each bucket tallies a `total` and a per-[severity-group](./severity.md) breakdown (so the chart can stack).
- **Edge cases:**
  - No records → `[]`.
  - Zero span (all records share one timestamp) → a single bucket holding everything.
  - The max-timestamp record is clamped into the **last** bucket (so it doesn't fall off the right edge).

## Testing

`src/lib/__tests__/histogram.test.ts` covers empty input, zero-span collapse, bucket count/boundaries, the edge clamp, and per-severity tallies.

## Related

- [`Histogram`](../components/histogram-chart.md) — the renderer.
- [Severity](./severity.md) — the stack groups.

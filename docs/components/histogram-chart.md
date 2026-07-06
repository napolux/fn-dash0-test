# `Histogram`

**File:** `src/components/Histogram.tsx`

## Purpose

Visualize log volume over time as a **severity-stacked bar chart** (X: time, Y: count), built with [Recharts](https://recharts.org).

## Props

```ts
interface HistogramProps {
  records: FlatLogRecord[];
  bucketCount?: number; // default 48
}
```

## Behavior

- Buckets the records with [`buildHistogram`](../lib/histogram.md) (all math is there; this component only renders).
- Renders one stacked `<Bar>` per **active** severity group — groups with zero total across all buckets are omitted, keeping the legend uncluttered. Stack/legend order follows `SEVERITY_GROUPS`; colors come from [`SEVERITY_STYLES`](../lib/severity.md).
- A **custom tooltip** shows the bucket's time range, total, and a per-severity breakdown.
- X-axis ticks are formatted clock labels ([`formatClock`](../lib/otlp-transforms.md)) with a min gap so they don't crowd; Y-axis is integer counts.
- Empty input renders a "No data to plot" placeholder.

## Testing

The chart depends on real layout (Recharts + `ResponsiveContainer`), which jsdom doesn't provide, so it is **stubbed** in the [`LogViewer`](./log-viewer.md) test; its logic is covered by the [`buildHistogram`](../lib/histogram.md) unit tests, and its rendering is verified via the dev-server smoke test.

## Related

- [Histogram bucketing](../lib/histogram.md) · [Severity](../lib/severity.md)

# `Histogram`

**File:** `src/components/Histogram.tsx`

## Purpose

Visualize log volume over time as a **severity-stacked bar chart** (X: time, Y: count), built with [Recharts](https://recharts.org). Its legend doubles as the **severity filter** control.

## Props

```ts
interface HistogramProps {
  records: FlatLogRecord[];
  bucketCount?: number;                          // default 48
  selectedSeverities?: SeverityGroup[];          // inclusion filter; empty/undefined = all
  onToggleSeverity?: (group: SeverityGroup) => void; // makes legend items toggles
}
```

## Behavior

- Buckets the records with [`buildHistogram`](../lib/histogram.md) (all math is there; this component only renders).
- Renders one stacked `<Bar>` per **enabled** severity group present in the data — under an active `selectedSeverities` filter, disabled groups drop out of the chart. Stack/legend order follows `SEVERITY_GROUPS`; colors come from [`SEVERITY_STYLES`](../lib/severity.md).
- **Legend = filter:** each legend entry is a `<button>`. When `onToggleSeverity` is provided, clicking it toggles that severity (via [`toggleSeverity`](../lib/view-state.md)); entries carry `aria-pressed` under an active filter and dim when disabled. Without a handler the entries render disabled (static legend).
- A **custom tooltip** shows the bucket's time range, total, and a per-severity breakdown.
- X-axis ticks are formatted clock labels ([`formatClock`](../lib/otlp-transforms.md)) with a min gap; Y-axis is integer counts.
- Empty input renders a "No data to plot" placeholder.

> [`LogViewer`](./log-viewer.md) passes the **unfiltered** logs here so the legend stays a stable, complete control, while the list below shows the filtered result.

## Testing

`src/components/__tests__/Histogram.test.tsx` covers the legend: one entry per present severity, click → `onToggleSeverity('ERROR')`, `aria-pressed` under an active filter, entries disabled without a handler, and the empty placeholder. (The bars themselves need real layout, which jsdom lacks; their data is covered by [`buildHistogram`](../lib/histogram.md) tests and the dev-server smoke test.)

## Related

- [Histogram bucketing](../lib/histogram.md) · [Severity](../lib/severity.md) · [View state](../lib/view-state.md)

# `SeverityBadge`

**File:** `src/components/SeverityBadge.tsx`

## Purpose

A small, color-coded severity pill, used consistently in the list and detail views.

## Props

```ts
interface SeverityBadgeProps {
  group: SeverityGroup;
  label?: string; // original OTLP severityText, shown when it differs from the group
}
```

## Behavior

- Colors come from [`SEVERITY_STYLES[group].badgeClass`](../lib/severity.md) — one source of truth shared with the [histogram](./histogram-chart.md).
- Displays `label` when provided and it differs from the group name (e.g. a specific `severityText`); otherwise the group name. The `title` attribute always names the group.

## Related

- [Severity](../lib/severity.md) — the mapping and styles.

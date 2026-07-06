# `GroupedLogView`

**File:** `src/components/GroupedLogView.tsx`

## Purpose

The grouped alternative to the flat list: logs organized by **parent resource (service)**, each in a **collapsible** section.

## Props

```ts
interface GroupedLogViewProps {
  records: FlatLogRecord[];
}
```

## Behavior

- Derives sections with [`groupByResource`](../lib/grouping.md) (memoized) — noisiest services first.
- Each section has a header button (`aria-expanded`) showing the service name, namespace, version, and record count, with a chevron and a status dot.
- Collapse state is local, keyed by the group's `key`; sections are **expanded by default**.
- Each expanded section reuses [`LogTable`](./log-table.md) with `showHeader={false}`, so grouped and flat rows look and behave identically (including per-row expansion).
- Empty input renders a "No log records." state.

## Related

- [Grouping](../lib/grouping.md) — the data transform.
- [`LogTable`](./log-table.md) — reused per section.

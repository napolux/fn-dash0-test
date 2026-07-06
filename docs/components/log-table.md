# `LogTable`

**File:** `src/components/LogTable.tsx`

## Purpose

The flat log list — a table of **Severity / Time / Body** where every row expands to reveal its full detail. Built on [TanStack Table](https://tanstack.com/table) (headless) so the markup and styling are fully ours.

## Props

```ts
interface LogTableProps {
  records: FlatLogRecord[];
  showHeader?: boolean; // default true; hidden when embedded under a group heading
}
```

## Behavior

- Three columns via TanStack's column helper: Severity ([`SeverityBadge`](./severity-badge.md) + a chevron), Time ([`formatTimestamp`](../lib/otlp-transforms.md)), and a truncated Body.
- **Expandable rows** use `getExpandedRowModel` with `getRowCanExpand: () => true`; expansion state is local. Clicking a row toggles it, rendering [`LogDetails`](./log-details.md) in a full-width row beneath.
- Fixed layout (`table-fixed`) with a sticky header; the Body cell truncates.
- Empty input renders a "No log records." state.
- `showHeader={false}` is used by [`GroupedLogView`](./grouped-log-view.md) so grouped sections share one visual header.

> Note: TanStack's `useReactTable` triggers a React Compiler "incompatible library" lint note; it's expected (the table manages its own instance) and suppressed with a documented `eslint-disable`.

## Testing

`src/components/__tests__/LogTable.test.tsx` covers rendering a row, revealing attributes only after expansion, and the empty state.

## Related

- [`LogDetails`](./log-details.md) — the expanded content.
- [`SeverityBadge`](./severity-badge.md) · [`GroupedLogView`](./grouped-log-view.md)

# `EmptyState`

**File:** `src/components/EmptyState.tsx`

## Purpose

A small, reusable centered message for empty views, with an optional call-to-action button. Used by [`LogViewer`](./log-viewer.md) to distinguish a truly empty result from a filtered-empty one.

## Props

```ts
interface EmptyStateProps {
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
}
```

## Behavior

- Renders the `title`, optional `description`, and — when `action` is given — a button that calls `action.onClick`.
- Presentational and state-free; the caller decides the copy and the action.

## Testing

`src/components/__tests__/EmptyState.test.tsx` covers rendering title/description, omitting the button when no action, and firing the action on click. The two log-viewer variants (no-data vs. filtered-empty, including the clear-filter flow) are covered in `LogViewer.test.tsx`.

## Related

- [`LogViewer`](./log-viewer.md) — chooses the variant.

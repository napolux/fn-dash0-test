# `CopyButton`

**File:** `src/components/CopyButton.tsx`

## Purpose

A small icon button that copies a value to the clipboard — used in [`LogDetails`](./log-details.md) for the body and each attribute value, a table-stakes affordance in observability tools.

## Props

```ts
interface CopyButtonProps {
  value: string;
  label?: string;   // what is copied, for the accessible label (default "value")
  className?: string;
}
```

## Behavior

- On click, writes `value` via `navigator.clipboard.writeText`, then flips the icon to a check and the accessible label to "Copied" for ~1.2s.
- The reset timer is cleared on unmount; clipboard failures are swallowed silently.
- Accessible label is `Copy {label}` (e.g. "Copy db.system"), becoming "Copied" after success.

## Testing

`src/components/__tests__/CopyButton.test.tsx` mocks `navigator.clipboard` and covers the write + "Copied" state flip and the default label.

## Related

- [`LogDetails`](./log-details.md) — the consumer.

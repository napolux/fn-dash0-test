# Severity

**File:** `src/lib/severity.ts` (mapping in `src/lib/otlp.ts`)

## Purpose

Normalize OTLP severity and provide a **single source of truth** for severity coloring, shared by the [histogram](./histogram.md) (hex colors) and the [`SeverityBadge`](../components/severity-badge.md) (Tailwind classes).

## Why normalize

OTLP `severityNumber` spans **1–24** in four-step bands (TRACE 1–4, DEBUG 5–8, …). `severityText` is optional and can be non-standard. Collapsing the number into a `SeverityGroup` keeps colors and (future) filtering consistent regardless of what text the backend sends.

`severityGroup(n)` (in `src/lib/otlp.ts`):

| `severityNumber` | Group |
| --- | --- |
| `< 1` / unset | `UNSPECIFIED` |
| 1–4 | `TRACE` |
| 5–8 | `DEBUG` |
| 9–12 | `INFO` |
| 13–16 | `WARN` |
| 17–20 | `ERROR` |
| 21–24 | `FATAL` |

## Exports (`severity.ts`)

- **`SEVERITY_GROUPS`** — the groups in ascending order of severity; drives legend and histogram **stack order**.
- **`SEVERITY_STYLES`** — per-group `{ color, badgeClass }`. `color` is a concrete hex (Recharts needs real colors, not CSS classes); `badgeClass` is the Tailwind pill styling, tuned for the dark theme.

## Related

- [OTLP transforms](./otlp-transforms.md) — `severityGroup`.
- [Histogram](./histogram.md) and [`SeverityBadge`](../components/severity-badge.md) — the two consumers of `SEVERITY_STYLES`.

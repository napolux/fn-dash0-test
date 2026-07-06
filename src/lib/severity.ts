import type { SeverityGroup } from '@/types/otlp';

/** Ordered from least to most severe — drives legend/stack order. */
export const SEVERITY_GROUPS: SeverityGroup[] = [
  'UNSPECIFIED',
  'TRACE',
  'DEBUG',
  'INFO',
  'WARN',
  'ERROR',
  'FATAL',
];

export interface SeverityStyle {
  /** Hex color for charts (Recharts needs concrete colors, not CSS classes). */
  color: string;
  /** Tailwind classes for the severity badge. */
  badgeClass: string;
}

/**
 * Single source of truth for severity coloring, shared by the histogram (hex) and
 * the badge (Tailwind). Palette is tuned for a dark observability UI.
 */
export const SEVERITY_STYLES: Record<SeverityGroup, SeverityStyle> = {
  UNSPECIFIED: {
    color: '#64748b',
    badgeClass: 'bg-slate-500/15 text-slate-300 ring-slate-500/30',
  },
  TRACE: {
    color: '#8b5cf6',
    badgeClass: 'bg-violet-500/15 text-violet-300 ring-violet-500/30',
  },
  DEBUG: {
    color: '#38bdf8',
    badgeClass: 'bg-sky-500/15 text-sky-300 ring-sky-500/30',
  },
  INFO: {
    color: '#22c55e',
    badgeClass: 'bg-green-500/15 text-green-300 ring-green-500/30',
  },
  WARN: {
    color: '#f59e0b',
    badgeClass: 'bg-amber-500/15 text-amber-300 ring-amber-500/30',
  },
  ERROR: {
    color: '#ef4444',
    badgeClass: 'bg-red-500/15 text-red-300 ring-red-500/30',
  },
  FATAL: {
    color: '#e11d48',
    badgeClass: 'bg-rose-600/20 text-rose-300 ring-rose-500/40',
  },
};

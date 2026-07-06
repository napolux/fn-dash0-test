'use client';

import { RefreshCw } from 'lucide-react';
import type { ViewMode } from '@/lib/viewState';

interface ToolbarProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onRefresh: () => void;
  loading: boolean;
  /** Number of records currently shown (after filtering). */
  count: number;
  /** Total number of records before filtering. */
  total: number;
}

const MODES: { value: ViewMode; label: string }[] = [
  { value: 'flat', label: 'Flat list' },
  { value: 'grouped', label: 'Group by service' },
];

/** Controls row: flat/grouped toggle, record count, and a refresh action. */
export function Toolbar({
  viewMode,
  onViewModeChange,
  onRefresh,
  loading,
  count,
  total,
}: ToolbarProps) {
  const filtered = count !== total;
  const countLabel = filtered
    ? `${count.toLocaleString()} of ${total.toLocaleString()} records`
    : `${count.toLocaleString()} ${count === 1 ? 'record' : 'records'}`;
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div
        role="tablist"
        aria-label="View mode"
        className="inline-flex rounded-lg border border-border bg-surface p-0.5"
      >
        {MODES.map((mode) => {
          const active = viewMode === mode.value;
          return (
            <button
              key={mode.value}
              role="tab"
              aria-selected={active}
              onClick={() => onViewModeChange(mode.value)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                active
                  ? 'bg-sky-500/15 text-sky-300 ring-1 ring-inset ring-sky-500/30'
                  : 'text-muted hover:text-foreground'
              }`}
            >
              {mode.label}
            </button>
          );
        })}
      </div>

      <span
        className={`font-mono text-xs whitespace-nowrap ${filtered ? 'text-sky-300' : 'text-muted'}`}
      >
        {countLabel}
      </span>

      <button
        onClick={onRefresh}
        disabled={loading}
        className="ml-auto inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-white/[0.04] disabled:cursor-not-allowed disabled:opacity-60"
      >
        <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} aria-hidden />
        {loading ? 'Loading…' : 'Refresh'}
      </button>
    </div>
  );
}

'use client';

import { useMemo, useState } from 'react';
import type { FlatLogRecord } from '@/types/otlp';
import { groupByResource } from '@/lib/grouping';
import { LogTable } from '@/components/LogTable';

interface GroupedLogViewProps {
  records: FlatLogRecord[];
}

function GroupHeader({
  serviceName,
  namespace,
  version,
  count,
  open,
  onToggle,
}: {
  serviceName: string;
  namespace?: string;
  version?: string;
  count: number;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={open}
      className="flex w-full items-center gap-3 bg-surface/80 px-4 py-2.5 text-left transition-colors hover:bg-white/[0.04]"
    >
      <svg
        viewBox="0 0 16 16"
        className={`h-3.5 w-3.5 text-muted transition-transform ${open ? 'rotate-90' : ''}`}
        aria-hidden
      >
        <path d="M6 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.75" />
      </svg>
      <span className="h-2 w-2 rounded-full bg-sky-400" aria-hidden />
      <span className="font-semibold text-foreground">{serviceName}</span>
      {namespace && (
        <span className="font-mono text-xs text-muted">ns:{namespace}</span>
      )}
      {version && <span className="font-mono text-xs text-muted">v{version}</span>}
      <span className="ml-auto rounded-full bg-white/5 px-2 py-0.5 font-mono text-xs text-muted">
        {count} {count === 1 ? 'log' : 'logs'}
      </span>
    </button>
  );
}

/** Logs organized by parent resource (service), each a collapsible section. */
export function GroupedLogView({ records }: GroupedLogViewProps) {
  const groups = useMemo(() => groupByResource(records), [records]);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  if (groups.length === 0) {
    return <p className="px-4 py-6 text-center text-sm text-muted">No log records.</p>;
  }

  return (
    <div className="divide-y divide-border">
      {groups.map((group) => {
        const open = !collapsed[group.key];
        return (
          <section key={group.key}>
            <GroupHeader
              serviceName={group.serviceName}
              namespace={group.serviceNamespace}
              version={group.serviceVersion}
              count={group.count}
              open={open}
              onToggle={() =>
                setCollapsed((prev) => ({ ...prev, [group.key]: !prev[group.key] }))
              }
            />
            {open && (
              <div className="border-t border-border/60">
                <LogTable records={group.records} showHeader={false} />
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}

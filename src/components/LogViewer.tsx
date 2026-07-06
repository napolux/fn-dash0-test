'use client';

import { useCallback, useMemo } from 'react';
import { useLogs } from '@/hooks/useLogs';
import { useLogViewState } from '@/hooks/useLogViewState';
import { selectLogs, toggleSeverity } from '@/lib/viewState';
import type { SeverityGroup } from '@/types/otlp';
import { Toolbar } from '@/components/Toolbar';
import { Histogram } from '@/components/Histogram';
import { LogTable } from '@/components/LogTable';
import { GroupedLogView } from '@/components/GroupedLogView';
import { EmptyState } from '@/components/EmptyState';

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`overflow-hidden rounded-xl border border-border bg-surface/50 ${className}`}
    >
      {children}
    </div>
  );
}

/** Top-level client container: owns data + view state and composes the viewer. */
export function LogViewer() {
  const { logs, loading, error, refetch } = useLogs();
  const { state, setViewMode, update } = useLogViewState();

  const visibleLogs = useMemo(() => selectLogs(logs, state), [logs, state]);

  const handleToggleSeverity = useCallback(
    (group: SeverityGroup) => update({ severity: toggleSeverity(state.severity, group) }),
    [update, state.severity],
  );

  const hasActiveFilter = (state.severity?.length ?? 0) > 0;
  const initialLoading = loading && logs.length === 0;

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-4 py-6 sm:px-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">OTLP Log Viewer</h1>
        <p className="text-sm text-muted">
          Scan OpenTelemetry log records, drill into attributes, and see volume over time.
        </p>
      </header>

      {error ? (
        <Card className="p-6">
          <div className="flex flex-col items-start gap-3">
            <p className="text-sm text-red-300">Failed to load logs: {error}</p>
            <button
              onClick={refetch}
              className="rounded-lg border border-border bg-surface px-3 py-1.5 text-sm font-medium hover:bg-white/[0.04]"
            >
              Try again
            </button>
          </div>
        </Card>
      ) : (
        <>
          <Card className="p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-[11px] font-semibold uppercase tracking-wider text-muted">
                Log volume over time
              </h2>
            </div>
            {loading && logs.length === 0 ? (
              <div className="flex h-[140px] items-center justify-center text-sm text-muted">
                Loading histogram…
              </div>
            ) : (
              // The histogram plots all logs and doubles as the severity filter, so its
              // legend stays a stable control; the list below reflects the active filters.
              <Histogram
                records={logs}
                selectedSeverities={state.severity}
                onToggleSeverity={handleToggleSeverity}
              />
            )}
          </Card>

          <Toolbar
            viewMode={state.viewMode}
            onViewModeChange={setViewMode}
            onRefresh={refetch}
            loading={loading}
            count={visibleLogs.length}
            total={logs.length}
          />

          <Card>
            {initialLoading ? (
              <p className="px-4 py-10 text-center text-sm text-muted">Loading logs…</p>
            ) : visibleLogs.length === 0 ? (
              hasActiveFilter ? (
                <EmptyState
                  title="No logs match the active filter"
                  description="No records match the selected severities. Clear the filter to see all logs."
                  action={{ label: 'Clear filter', onClick: () => update({ severity: undefined }) }}
                />
              ) : (
                <EmptyState
                  title="No logs to show"
                  description="The API returned no log records for this request."
                  action={{ label: 'Refresh', onClick: refetch }}
                />
              )
            ) : (
              <div className="max-h-[60vh] overflow-auto">
                {state.viewMode === 'grouped' ? (
                  <GroupedLogView records={visibleLogs} />
                ) : (
                  <LogTable records={visibleLogs} />
                )}
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  );
}

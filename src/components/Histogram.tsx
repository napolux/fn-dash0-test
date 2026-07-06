'use client';

import { useMemo } from 'react';
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { FlatLogRecord, SeverityGroup } from '@/types/otlp';
import { buildHistogram } from '@/lib/histogram';
import { SEVERITY_GROUPS, SEVERITY_STYLES } from '@/lib/severity';
import { formatClock, formatRange } from '@/lib/format';

interface HistogramProps {
  records: FlatLogRecord[];
  bucketCount?: number;
}

interface ChartDatum extends Record<SeverityGroup, number> {
  startMs: number;
  endMs: number;
  total: number;
}

/** Recharts passes the hovered datum through `payload`; type just what we read. */
interface HistogramTooltipProps {
  active?: boolean;
  payload?: { payload: ChartDatum }[];
}

function HistogramTooltip({ active, payload }: HistogramTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;
  const datum = payload[0].payload;
  const present = SEVERITY_GROUPS.filter((g) => datum[g] > 0).reverse();
  return (
    <div className="rounded-md border border-border bg-surface/95 px-3 py-2 text-xs shadow-lg backdrop-blur">
      <div className="mb-1 font-mono text-muted">{formatRange(datum.startMs, datum.endMs)}</div>
      <div className="mb-1.5 font-semibold text-foreground">{datum.total} logs</div>
      <div className="space-y-0.5">
        {present.map((group) => (
          <div key={group} className="flex items-center gap-2">
            <span
              className="h-2 w-2 rounded-sm"
              style={{ background: SEVERITY_STYLES[group].color }}
            />
            <span className="text-muted">{group}</span>
            <span className="ml-auto font-mono text-foreground">{datum[group]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Time-bucketed log volume as a severity-stacked bar chart (X: time, Y: count). */
export function Histogram({ records, bucketCount = 48 }: HistogramProps) {
  const { data, activeGroups } = useMemo(() => {
    const buckets = buildHistogram(records, bucketCount);
    const chartData: ChartDatum[] = buckets.map((bucket) => ({
      startMs: bucket.startMs,
      endMs: bucket.endMs,
      total: bucket.total,
      ...bucket.counts,
    }));
    const groups = SEVERITY_GROUPS.filter((g) => buckets.some((b) => b.counts[g] > 0));
    return { data: chartData, activeGroups: groups };
  }, [records, bucketCount]);

  if (records.length === 0) {
    return (
      <div className="flex h-[140px] items-center justify-center text-sm text-muted">
        No data to plot
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="h-[140px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -24 }} barCategoryGap={1}>
            <XAxis
              dataKey="startMs"
              tickFormatter={formatClock}
              tick={{ fill: 'var(--muted)', fontSize: 10 }}
              tickLine={false}
              axisLine={{ stroke: 'var(--border)' }}
              minTickGap={48}
            />
            <YAxis
              allowDecimals={false}
              width={44}
              tick={{ fill: 'var(--muted)', fontSize: 10 }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              content={<HistogramTooltip />}
              cursor={{ fill: 'rgba(255,255,255,0.05)' }}
            />
            {activeGroups.map((group, index) => (
              <Bar
                key={group}
                dataKey={group}
                stackId="severity"
                fill={SEVERITY_STYLES[group].color}
                radius={index === activeGroups.length - 1 ? [2, 2, 0, 0] : undefined}
                isAnimationActive={false}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        {activeGroups.map((group) => (
          <span key={group} className="flex items-center gap-1.5 text-[11px] text-muted">
            <span
              className="h-2 w-2 rounded-sm"
              style={{ background: SEVERITY_STYLES[group].color }}
            />
            {group}
          </span>
        ))}
      </div>
    </div>
  );
}

import type { FlatLogRecord, SeverityGroup } from '@/types/otlp';
import { SEVERITY_GROUPS } from '@/lib/severity';

export interface HistogramBucket {
  startMs: number;
  endMs: number;
  total: number;
  /** Count per severity group, enabling stacked bars. */
  counts: Record<SeverityGroup, number>;
}

function emptyCounts(): Record<SeverityGroup, number> {
  return SEVERITY_GROUPS.reduce(
    (acc, group) => {
      acc[group] = 0;
      return acc;
    },
    {} as Record<SeverityGroup, number>,
  );
}

/**
 * Bucket records into `bucketCount` evenly spaced time bins spanning the min→max
 * timestamp, counting per severity group. Returns an empty array when there are no
 * records. When all records share one timestamp, a single bucket is returned.
 */
export function buildHistogram(records: FlatLogRecord[], bucketCount = 40): HistogramBucket[] {
  if (records.length === 0) return [];

  let minMs = Infinity;
  let maxMs = -Infinity;
  for (const record of records) {
    if (record.timestampMs < minMs) minMs = record.timestampMs;
    if (record.timestampMs > maxMs) maxMs = record.timestampMs;
  }

  const count = Math.max(1, Math.floor(bucketCount));
  const span = maxMs - minMs;

  // Degenerate span (all same time): a single bucket holding everything.
  if (span <= 0) {
    const counts = emptyCounts();
    for (const record of records) counts[record.severityGroup] += 1;
    return [{ startMs: minMs, endMs: minMs + 1, total: records.length, counts }];
  }

  const width = span / count;
  const buckets: HistogramBucket[] = Array.from({ length: count }, (_, i) => ({
    startMs: Math.round(minMs + i * width),
    endMs: Math.round(minMs + (i + 1) * width),
    total: 0,
    counts: emptyCounts(),
  }));

  for (const record of records) {
    // Clamp the final edge so the max-timestamp record lands in the last bucket.
    const rawIndex = Math.floor((record.timestampMs - minMs) / width);
    const index = Math.min(count - 1, Math.max(0, rawIndex));
    buckets[index].total += 1;
    buckets[index].counts[record.severityGroup] += 1;
  }

  return buckets;
}

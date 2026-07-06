import { describe, expect, it } from 'vitest';
import { buildHistogram } from '@/lib/histogram';
import type { FlatLogRecord, SeverityGroup } from '@/types/otlp';

function record(timestampMs: number, severityGroup: SeverityGroup = 'INFO'): FlatLogRecord {
  return {
    id: `${timestampMs}`,
    timeUnixNano: String(timestampMs * 1_000_000),
    timestampMs,
    severityNumber: 9,
    severityText: severityGroup,
    severityGroup,
    body: 'x',
    attributes: [],
    resource: { key: 's', serviceName: 's', attributes: [] },
    scope: {},
  };
}

describe('buildHistogram', () => {
  it('returns an empty array for no records', () => {
    expect(buildHistogram([])).toEqual([]);
  });

  it('collapses a zero-span range into a single bucket', () => {
    const buckets = buildHistogram([record(1000), record(1000)], 40);
    expect(buckets).toHaveLength(1);
    expect(buckets[0].total).toBe(2);
  });

  it('produces the requested number of buckets spanning min→max', () => {
    const buckets = buildHistogram([record(0), record(100)], 10);
    expect(buckets).toHaveLength(10);
    expect(buckets[0].startMs).toBe(0);
    expect(buckets[buckets.length - 1].endMs).toBe(100);
  });

  it('places the max-timestamp record in the last bucket (edge clamp)', () => {
    const buckets = buildHistogram([record(0), record(50), record(100)], 10);
    expect(buckets[0].total).toBe(1);
    expect(buckets[buckets.length - 1].total).toBe(1);
    const total = buckets.reduce((sum, b) => sum + b.total, 0);
    expect(total).toBe(3);
  });

  it('tallies counts per severity group', () => {
    const buckets = buildHistogram([record(0, 'ERROR'), record(0, 'INFO')], 1);
    expect(buckets[0].counts.ERROR).toBe(1);
    expect(buckets[0].counts.INFO).toBe(1);
    expect(buckets[0].counts.WARN).toBe(0);
  });
});

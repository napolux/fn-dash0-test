import { describe, expect, it } from 'vitest';
import { groupByResource } from '@/lib/grouping';
import type { FlatLogRecord } from '@/types/otlp';

function record(serviceName: string, namespace?: string): FlatLogRecord {
  return {
    id: `${serviceName}-${Math.random()}`,
    timeUnixNano: '0',
    timestampMs: 0,
    severityNumber: 9,
    severityText: 'INFO',
    severityGroup: 'INFO',
    body: 'x',
    attributes: [],
    resource: {
      key: [namespace ?? '', serviceName].join('/'),
      serviceName,
      serviceNamespace: namespace,
      attributes: [],
    },
    scope: {},
  };
}

describe('groupByResource', () => {
  it('returns an empty array for no records', () => {
    expect(groupByResource([])).toEqual([]);
  });

  it('groups records by resource key', () => {
    const groups = groupByResource([record('a'), record('b'), record('a')]);
    expect(groups).toHaveLength(2);
    const a = groups.find((g) => g.serviceName === 'a');
    expect(a?.count).toBe(2);
    expect(a?.records).toHaveLength(2);
  });

  it('sorts groups by count descending', () => {
    const groups = groupByResource([record('a'), record('b'), record('b'), record('b')]);
    expect(groups.map((g) => g.serviceName)).toEqual(['b', 'a']);
  });

  it('separates same service name in different namespaces', () => {
    const groups = groupByResource([record('api', 'team-x'), record('api', 'team-y')]);
    expect(groups).toHaveLength(2);
  });
});

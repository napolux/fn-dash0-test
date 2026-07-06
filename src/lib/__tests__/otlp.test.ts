import { describe, expect, it } from 'vitest';
import {
  anyValueToJs,
  anyValueToString,
  flattenAttributes,
  flattenLogs,
  severityGroup,
  unixNanoToMillis,
} from '@/lib/otlp';
import type { IExportLogsServiceRequest } from '@/types/otlp';
import sample from './logs.sample.json';

describe('anyValueToJs', () => {
  it('reads each scalar variant', () => {
    expect(anyValueToJs({ stringValue: 'hi' })).toBe('hi');
    expect(anyValueToJs({ boolValue: true })).toBe(true);
    expect(anyValueToJs({ doubleValue: 3.14 })).toBe(3.14);
    expect(anyValueToJs({ intValue: 42 })).toBe(42);
  });

  it('coerces string-encoded intValue (protobuf-JSON) to a number', () => {
    expect(anyValueToJs({ intValue: '504' })).toBe(504);
  });

  it('keeps oversized int strings intact instead of losing precision', () => {
    const big = '9223372036854775807';
    expect(anyValueToJs({ intValue: big })).toBe(big);
  });

  it('recurses into arrayValue', () => {
    expect(
      anyValueToJs({ arrayValue: { values: [{ stringValue: 'a' }, { intValue: 1 }] } }),
    ).toEqual(['a', 1]);
  });

  it('recurses into kvlistValue', () => {
    expect(
      anyValueToJs({
        kvlistValue: { values: [{ key: 'k', value: { stringValue: 'v' } }] },
      }),
    ).toEqual({ k: 'v' });
  });

  it('returns undefined for empty/absent values', () => {
    expect(anyValueToJs(undefined)).toBeUndefined();
    expect(anyValueToJs({})).toBeUndefined();
  });
});

describe('anyValueToString', () => {
  it('passes strings through unchanged', () => {
    expect(anyValueToString({ stringValue: 'hello' })).toBe('hello');
  });

  it('JSON-encodes structured values', () => {
    expect(anyValueToString({ arrayValue: { values: [{ intValue: 1 }] } })).toBe('[1]');
    expect(anyValueToString(undefined)).toBe('');
  });
});

describe('flattenAttributes', () => {
  it('maps key-values into string pairs', () => {
    expect(
      flattenAttributes([
        { key: 'http.method', value: { stringValue: 'GET' } },
        { key: 'http.status_code', value: { intValue: 200 } },
      ]),
    ).toEqual([
      { key: 'http.method', value: 'GET' },
      { key: 'http.status_code', value: '200' },
    ]);
  });
});

describe('severityGroup', () => {
  it.each([
    [0, 'UNSPECIFIED'],
    [1, 'TRACE'],
    [4, 'TRACE'],
    [5, 'DEBUG'],
    [9, 'INFO'],
    [13, 'WARN'],
    [17, 'ERROR'],
    [21, 'FATAL'],
    [24, 'FATAL'],
  ] as const)('maps severityNumber %i to %s', (num, group) => {
    expect(severityGroup(num)).toBe(group);
  });

  it('treats undefined as UNSPECIFIED', () => {
    expect(severityGroup(undefined)).toBe('UNSPECIFIED');
  });
});

describe('unixNanoToMillis', () => {
  it('converts nanoseconds to integer milliseconds without precision loss', () => {
    expect(unixNanoToMillis('1783242041688000000')).toBe(1783242041688);
  });

  it('is resilient to missing/invalid input', () => {
    expect(unixNanoToMillis(undefined)).toBe(0);
    expect(unixNanoToMillis('not-a-number')).toBe(0);
  });
});

describe('flattenLogs', () => {
  const fixture: IExportLogsServiceRequest = {
    resourceLogs: [
      {
        resource: {
          attributes: [
            { key: 'service.namespace', value: { stringValue: 'shop' } },
            { key: 'service.name', value: { stringValue: 'checkout' } },
            { key: 'service.version', value: { stringValue: '1.2.3' } },
          ],
        },
        scopeLogs: [
          {
            scope: { name: 'app', version: '0.1' },
            logRecords: [
              {
                timeUnixNano: '2000000',
                severityNumber: 17,
                severityText: 'ERROR',
                body: { stringValue: 'boom' },
                attributes: [{ key: 'http.method', value: { stringValue: 'POST' } }],
              },
              {
                timeUnixNano: '1000000',
                severityNumber: 9,
                body: { stringValue: 'ok' },
              },
            ],
          },
        ],
      },
    ],
  };

  it('flattens nested records and carries resource + scope context', () => {
    const records = flattenLogs(fixture);
    expect(records).toHaveLength(2);
    const [first] = records;
    expect(first.resource.serviceName).toBe('checkout');
    expect(first.resource.serviceNamespace).toBe('shop');
    expect(first.resource.key).toBe('shop/checkout');
    expect(first.scope.name).toBe('app');
    expect(first.body).toBe('boom');
    expect(first.attributes).toEqual([{ key: 'http.method', value: 'POST' }]);
  });

  it('sorts records newest-first by timestamp', () => {
    const records = flattenLogs(fixture);
    expect(records.map((r) => r.timestampMs)).toEqual([2, 1]);
  });

  it('derives severityText from severityNumber when absent', () => {
    const records = flattenLogs(fixture);
    const info = records.find((r) => r.timestampMs === 1);
    expect(info?.severityText).toBe('INFO');
    expect(info?.severityGroup).toBe('INFO');
  });

  it('falls back to a placeholder service name when unset', () => {
    const records = flattenLogs({
      resourceLogs: [{ scopeLogs: [{ logRecords: [{ timeUnixNano: '1000000' }] }] }],
    });
    expect(records[0].resource.serviceName).toBe('unknown_service');
  });

  it('returns an empty array for empty/undefined input', () => {
    expect(flattenLogs(undefined)).toEqual([]);
    expect(flattenLogs({})).toEqual([]);
  });

  it('flattens the real API sample fixture', () => {
    const records = flattenLogs(sample as IExportLogsServiceRequest);
    expect(records.length).toBeGreaterThan(0);
    for (const record of records) {
      expect(typeof record.body).toBe('string');
      expect(record.resource.serviceName.length).toBeGreaterThan(0);
      expect(record.id).toMatch(/^\d+-\d+-\d+$/);
    }
  });
});

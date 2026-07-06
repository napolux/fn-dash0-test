import { describe, expect, it } from 'vitest';
import {
  DEFAULT_VIEW_STATE,
  parseViewState,
  selectLogs,
  serializeViewState,
  toggleSeverity,
  type LogViewState,
} from '@/lib/viewState';
import type { FlatLogRecord, SeverityGroup } from '@/types/otlp';

function record(overrides: Partial<FlatLogRecord> = {}): FlatLogRecord {
  return {
    id: Math.random().toString(),
    timeUnixNano: '0',
    timestampMs: 0,
    severityNumber: 9,
    severityText: 'INFO',
    severityGroup: 'INFO',
    body: 'hello world',
    attributes: [],
    resource: { key: 'shop/checkout', serviceName: 'checkout', attributes: [] },
    scope: {},
    ...overrides,
  };
}

function roundTrip(state: LogViewState): LogViewState {
  return parseViewState(serializeViewState(state));
}

describe('serializeViewState / parseViewState', () => {
  it('omits defaults so the URL stays clean', () => {
    expect(serializeViewState(DEFAULT_VIEW_STATE).toString()).toBe('');
  });

  it('round-trips the view mode', () => {
    expect(roundTrip({ viewMode: 'grouped' })).toEqual({ viewMode: 'grouped' });
  });

  it('round-trips reserved filter fields (URL contract locked ahead of the UI)', () => {
    const state: LogViewState = {
      viewMode: 'grouped',
      severity: ['ERROR', 'FATAL'],
      service: 'checkout',
      from: 1000,
      to: 2000,
    };
    expect(roundTrip(state)).toEqual(state);
  });

  it('ignores unknown/invalid params and falls back to defaults', () => {
    const state = parseViewState(new URLSearchParams('view=bogus&severity=NOPE'));
    expect(state).toEqual(DEFAULT_VIEW_STATE);
  });

  it('drops invalid severities but keeps valid ones', () => {
    const state = parseViewState(new URLSearchParams('severity=ERROR,NOPE'));
    expect(state.severity).toEqual(['ERROR']);
  });
});

describe('selectLogs', () => {
  const records = [
    record({ severityGroup: 'ERROR' }),
    record({ severityGroup: 'INFO' }),
    record({ severityGroup: 'WARN' }),
  ];

  it('returns the input unchanged when no filter is active', () => {
    expect(selectLogs(records, DEFAULT_VIEW_STATE)).toBe(records);
  });

  it('filters by the enabled severity set', () => {
    const result = selectLogs(records, { viewMode: 'flat', severity: ['ERROR', 'WARN'] });
    expect(result.map((r) => r.severityGroup)).toEqual(['ERROR', 'WARN']);
  });

  it('treats an empty severity set as no filter', () => {
    expect(selectLogs(records, { viewMode: 'flat', severity: [] })).toBe(records);
  });
});

describe('toggleSeverity', () => {
  it('adds a group to an empty selection', () => {
    expect(toggleSeverity(undefined, 'ERROR')).toEqual(['ERROR']);
  });

  it('appends without dropping existing groups', () => {
    expect(toggleSeverity(['ERROR'], 'WARN')).toEqual(['ERROR', 'WARN']);
  });

  it('removes a group that is already selected', () => {
    expect(toggleSeverity(['ERROR', 'WARN'], 'ERROR')).toEqual(['WARN']);
  });

  it('returns undefined when the last group is removed', () => {
    expect(toggleSeverity(['ERROR'], 'ERROR')).toBeUndefined();
  });

  it('round-trips through the URL serialization', () => {
    const groups = toggleSeverity(undefined, 'FATAL') as SeverityGroup[];
    expect(roundTrip({ viewMode: 'flat', severity: groups }).severity).toEqual(['FATAL']);
  });
});

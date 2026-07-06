import { describe, expect, it } from 'vitest';
import {
  DEFAULT_VIEW_STATE,
  parseViewState,
  selectLogs,
  serializeViewState,
  type LogViewState,
} from '@/lib/viewState';
import type { FlatLogRecord } from '@/types/otlp';

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
  it('is a pass-through today (filter seam reserved for later)', () => {
    const records = [{ id: '1' }] as unknown as FlatLogRecord[];
    expect(selectLogs(records, DEFAULT_VIEW_STATE)).toBe(records);
  });
});

import { describe, expect, it } from 'vitest';
import { formatClock, formatRange, formatRelativeTime, formatTimestamp } from '@/lib/format';

describe('formatRelativeTime', () => {
  const now = 1_000_000_000_000; // fixed reference

  it('shows "just now" for very recent times', () => {
    expect(formatRelativeTime(now, now)).toBe('just now');
    expect(formatRelativeTime(now - 3_000, now)).toBe('just now');
  });

  it.each([
    [10_000, '10s ago'],
    [90_000, '1m ago'],
    [2 * 3_600_000, '2h ago'],
    [3 * 86_400_000, '3d ago'],
  ])('formats a %ims-old time as %s', (ageMs, expected) => {
    expect(formatRelativeTime(now - ageMs, now)).toBe(expected);
  });

  it('falls back to an absolute timestamp for times older than a week', () => {
    const old = now - 10 * 86_400_000;
    expect(formatRelativeTime(old, now)).toBe(formatTimestamp(old));
  });

  it('returns a dash for a missing timestamp', () => {
    expect(formatRelativeTime(0)).toBe('—');
  });
});

describe('formatTimestamp', () => {
  it('returns a dash for a missing timestamp', () => {
    expect(formatTimestamp(0)).toBe('—');
  });

  it('includes a time with millisecond precision', () => {
    expect(formatTimestamp(1_700_000_000_123)).toMatch(/\d{2}:\d{2}:\d{2}\.\d{3}/);
  });
});

describe('formatClock / formatRange', () => {
  it('formats a clock label and a range', () => {
    expect(formatClock(1_700_000_000_000)).toMatch(/\d{2}:\d{2}:\d{2}/);
    expect(formatRange(1_700_000_000_000, 1_700_000_003_000)).toContain('–');
  });
});

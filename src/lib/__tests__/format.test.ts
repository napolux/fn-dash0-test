import { describe, expect, it } from 'vitest';
import { formatClock, formatRange, formatRelativeTime, formatTimestamp } from '@/lib/format';

// These cover only our thin wrappers (missing-value guards and the range joiner).
// The actual date/time formatting is date-fns' responsibility and isn't re-tested here.

describe('format guards', () => {
  it('returns a dash for a missing timestamp', () => {
    expect(formatTimestamp(0)).toBe('—');
    expect(formatRelativeTime(0)).toBe('—');
  });

  it('returns an empty clock for a missing timestamp', () => {
    expect(formatClock(0)).toBe('');
  });

  it('produces a real value for a valid timestamp', () => {
    expect(formatTimestamp(1_700_000_000_123)).not.toBe('—');
    expect(formatRelativeTime(Date.now() - 10_000)).not.toBe('—');
  });
});

describe('formatRange', () => {
  it('joins two clock labels with a separator', () => {
    expect(formatRange(1_700_000_000_000, 1_700_000_003_000)).toContain(' – ');
  });
});

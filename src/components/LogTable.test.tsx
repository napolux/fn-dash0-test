import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LogTable } from '@/components/LogTable';
import type { FlatLogRecord } from '@/types/otlp';

function record(overrides: Partial<FlatLogRecord> = {}): FlatLogRecord {
  return {
    id: '0-0-0',
    timeUnixNano: '1000000',
    timestampMs: 1,
    severityNumber: 17,
    severityText: 'ERROR',
    severityGroup: 'ERROR',
    body: 'checkout failed',
    attributes: [{ key: 'http.method', value: 'POST' }],
    resource: { key: 'shop/checkout', serviceName: 'checkout', attributes: [] },
    scope: {},
    ...overrides,
  };
}

describe('LogTable', () => {
  it('renders a row per record with severity and body', () => {
    render(<LogTable records={[record()]} />);
    expect(screen.getByText('ERROR')).toBeInTheDocument();
    expect(screen.getByText('checkout failed')).toBeInTheDocument();
  });

  it('reveals attributes only after the row is expanded', async () => {
    const user = userEvent.setup();
    render(<LogTable records={[record()]} />);

    // Collapsed: the attribute key is not shown yet.
    expect(screen.queryByText('http.method')).not.toBeInTheDocument();

    await user.click(screen.getByText('checkout failed'));

    expect(screen.getByText('http.method')).toBeInTheDocument();
    expect(screen.getByText('Log attributes')).toBeInTheDocument();
  });

  it('renders an empty state when there are no records', () => {
    render(<LogTable records={[]} />);
    expect(screen.getByText('No log records.')).toBeInTheDocument();
  });
});

import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { FlatLogRecord } from '@/types/otlp';

// Stub the histogram (Recharts needs real layout) so the test stays focused on the
// list + toggle behavior.
vi.mock('@/components/Histogram', () => ({
  Histogram: () => <div data-testid="histogram" />,
}));

const logs: FlatLogRecord[] = [
  {
    id: '0-0-0',
    timeUnixNano: '2000000',
    timestampMs: 2,
    severityNumber: 17,
    severityText: 'ERROR',
    severityGroup: 'ERROR',
    body: 'checkout boom',
    attributes: [],
    resource: { key: 'shop/checkout', serviceName: 'checkout', attributes: [] },
    scope: {},
  },
  {
    id: '1-0-0',
    timeUnixNano: '1000000',
    timestampMs: 1,
    severityNumber: 9,
    severityText: 'INFO',
    severityGroup: 'INFO',
    body: 'payment ok',
    attributes: [],
    resource: { key: 'shop/payment', serviceName: 'payment', attributes: [] },
    scope: {},
  },
];

vi.mock('@/hooks/useLogs', () => ({
  useLogs: () => ({ logs, loading: false, error: null, refetch: vi.fn() }),
}));

import { LogViewer } from '@/components/LogViewer';

describe('LogViewer', () => {
  it('starts in flat mode showing individual records', () => {
    render(<LogViewer />);
    expect(screen.getByText('checkout boom')).toBeInTheDocument();
    expect(screen.getByText('payment ok')).toBeInTheDocument();
    // Service group headers should not be present in flat mode.
    expect(screen.queryByText('2 logs')).not.toBeInTheDocument();
  });

  it('switches to grouped view when the toggle is clicked', async () => {
    const user = userEvent.setup();
    render(<LogViewer />);

    await user.click(screen.getByRole('tab', { name: 'Group by service' }));

    // Grouped view shows a collapsible section header per service.
    expect(screen.getByRole('button', { name: /checkout/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /payment/ })).toBeInTheDocument();
  });
});

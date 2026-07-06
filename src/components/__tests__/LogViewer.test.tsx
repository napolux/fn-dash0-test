import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { FlatLogRecord } from '@/types/otlp';

// Stub the histogram (Recharts needs real layout) so the test stays focused on the
// list, toggle, and empty-state behavior.
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

// Reconfigurable per-test holders shared with the module mocks (hoisted above them).
const h = vi.hoisted(() => ({
  logsReturn: null as unknown as {
    logs: unknown[];
    loading: boolean;
    error: string | null;
    refetch: () => void;
  },
  initialViewState: { viewMode: 'flat' } as { viewMode: 'flat' | 'grouped'; severity?: string[] },
}));

vi.mock('@/hooks/useLogs', () => ({ useLogs: () => h.logsReturn }));

// Back the view state with local React state so the test doesn't need a Next router.
// The real hook's URL wiring is covered in hooks/__tests__/useLogViewState.test.ts.
vi.mock('@/hooks/useLogViewState', async () => {
  const { useState, useCallback } = await import('react');
  return {
    useLogViewState: () => {
      const [state, setState] = useState(h.initialViewState);
      const update = useCallback(
        (patch: Record<string, unknown>) => setState((s) => ({ ...s, ...patch })),
        [],
      );
      const setViewMode = useCallback(
        (viewMode: 'flat' | 'grouped') => setState((s) => ({ ...s, viewMode })),
        [],
      );
      return { state, update, setViewMode };
    },
  };
});

import { LogViewer } from '@/components/LogViewer';

describe('LogViewer', () => {
  beforeEach(() => {
    h.logsReturn = { logs, loading: false, error: null, refetch: vi.fn() };
    h.initialViewState = { viewMode: 'flat' };
  });

  it('starts in flat mode showing individual records', () => {
    render(<LogViewer />);
    expect(screen.getByText('checkout boom')).toBeInTheDocument();
    expect(screen.getByText('payment ok')).toBeInTheDocument();
    expect(screen.queryByText('2 logs')).not.toBeInTheDocument();
  });

  it('switches to grouped view when the toggle is clicked', async () => {
    const user = userEvent.setup();
    render(<LogViewer />);

    await user.click(screen.getByRole('tab', { name: 'Group by service' }));

    expect(screen.getByRole('button', { name: /checkout/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /payment/ })).toBeInTheDocument();
  });

  it('shows skeleton placeholders during the initial load', () => {
    h.logsReturn = { logs: [], loading: true, error: null, refetch: vi.fn() };
    render(<LogViewer />);
    expect(screen.getByTestId('log-list-skeleton')).toBeInTheDocument();
    expect(screen.getByTestId('histogram-skeleton')).toBeInTheDocument();
  });

  it('shows a no-data empty state when the API returns no logs', () => {
    h.logsReturn = { logs: [], loading: false, error: null, refetch: vi.fn() };
    render(<LogViewer />);
    expect(screen.getByText('No logs to show')).toBeInTheDocument();
  });

  it('distinguishes a filtered-empty state and can clear the filter', async () => {
    const user = userEvent.setup();
    h.initialViewState = { viewMode: 'flat', severity: ['FATAL'] }; // matches none of the logs
    render(<LogViewer />);

    expect(screen.getByText('No logs match the active filter')).toBeInTheDocument();
    expect(screen.queryByText('checkout boom')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Clear filter' }));

    // Clearing the severity filter restores the full list.
    expect(screen.getByText('checkout boom')).toBeInTheDocument();
  });
});

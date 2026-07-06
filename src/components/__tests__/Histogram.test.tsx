import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { Histogram } from '@/components/Histogram';
import type { FlatLogRecord, SeverityGroup } from '@/types/otlp';

function record(severityGroup: SeverityGroup, timestampMs: number): FlatLogRecord {
  return {
    id: `${severityGroup}-${timestampMs}`,
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

const records = [record('ERROR', 1), record('INFO', 2), record('WARN', 3)];

describe('Histogram legend', () => {
  it('renders a legend entry per severity present in the data', () => {
    render(<Histogram records={records} />);
    expect(screen.getByRole('button', { name: /ERROR/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /INFO/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /WARN/ })).toBeInTheDocument();
  });

  it('toggles a severity when its legend entry is clicked', () => {
    const onToggleSeverity = vi.fn();
    render(<Histogram records={records} onToggleSeverity={onToggleSeverity} />);
    fireEvent.click(screen.getByRole('button', { name: /ERROR/ }));
    expect(onToggleSeverity).toHaveBeenCalledWith('ERROR');
  });

  it('marks unselected severities as not pressed under an active filter', () => {
    render(
      <Histogram records={records} selectedSeverities={['ERROR']} onToggleSeverity={vi.fn()} />,
    );
    expect(screen.getByRole('button', { name: /ERROR/ })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: /INFO/ })).toHaveAttribute('aria-pressed', 'false');
  });

  it('disables legend toggling when no handler is provided', () => {
    render(<Histogram records={records} />);
    expect(screen.getByRole('button', { name: /ERROR/ })).toBeDisabled();
  });

  it('shows a placeholder when there are no records', () => {
    render(<Histogram records={[]} />);
    expect(screen.getByText('No data to plot')).toBeInTheDocument();
  });
});

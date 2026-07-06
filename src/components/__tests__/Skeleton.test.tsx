import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HistogramSkeleton, LogListSkeleton } from '@/components/Skeleton';

describe('Skeletons', () => {
  it('renders the requested number of log list rows', () => {
    render(<LogListSkeleton rows={5} />);
    expect(screen.getByTestId('log-list-skeleton').children).toHaveLength(5);
  });

  it('defaults to a sensible number of rows', () => {
    render(<LogListSkeleton />);
    expect(screen.getByTestId('log-list-skeleton').children).toHaveLength(8);
  });

  it('renders the histogram skeleton', () => {
    render(<HistogramSkeleton />);
    expect(screen.getByTestId('histogram-skeleton')).toBeInTheDocument();
  });
});

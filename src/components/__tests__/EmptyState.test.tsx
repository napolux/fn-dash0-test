import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { EmptyState } from '@/components/EmptyState';

describe('EmptyState', () => {
  it('renders the title and optional description', () => {
    render(<EmptyState title="Nothing here" description="Try again later" />);
    expect(screen.getByText('Nothing here')).toBeInTheDocument();
    expect(screen.getByText('Try again later')).toBeInTheDocument();
  });

  it('renders no action button when none is provided', () => {
    render(<EmptyState title="Nothing here" />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('invokes the action when its button is clicked', () => {
    const onClick = vi.fn();
    render(<EmptyState title="Filtered out" action={{ label: 'Clear filter', onClick }} />);
    fireEvent.click(screen.getByRole('button', { name: 'Clear filter' }));
    expect(onClick).toHaveBeenCalledOnce();
  });
});

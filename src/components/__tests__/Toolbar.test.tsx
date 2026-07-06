import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { Toolbar } from '@/components/Toolbar';

function setup(overrides = {}) {
  const props = {
    viewMode: 'flat' as const,
    onViewModeChange: vi.fn(),
    onRefresh: vi.fn(),
    loading: false,
    count: 3,
    total: 3,
    ...overrides,
  };
  render(<Toolbar {...props} />);
  return props;
}

describe('Toolbar', () => {
  it('emits the view mode when a tab is clicked', () => {
    const { onViewModeChange } = setup();
    fireEvent.click(screen.getByRole('tab', { name: 'Group by service' }));
    expect(onViewModeChange).toHaveBeenCalledWith('grouped');
  });

  it('shows the plain record count when nothing is filtered', () => {
    setup({ count: 42, total: 42 });
    expect(screen.getByText('42 records')).toBeInTheDocument();
  });

  it('shows "N of M" when the list is filtered', () => {
    setup({ count: 3, total: 42 });
    expect(screen.getByText('3 of 42 records')).toBeInTheDocument();
  });

  it('disables refresh while loading', () => {
    setup({ loading: true });
    expect(screen.getByRole('button', { name: /Loading/ })).toBeDisabled();
  });
});

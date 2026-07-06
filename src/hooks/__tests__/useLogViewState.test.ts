import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';

// Mutable navigation stand-ins shared with the mock (hoisted above vi.mock).
const nav = vi.hoisted(() => ({
  replace: vi.fn(),
  params: new URLSearchParams(),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: nav.replace }),
  usePathname: () => '/',
  useSearchParams: () => nav.params,
}));

import { useLogViewState } from '@/hooks/useLogViewState';

describe('useLogViewState', () => {
  beforeEach(() => {
    nav.replace.mockClear();
    nav.params = new URLSearchParams();
  });

  it('defaults to flat view when the URL has no params', () => {
    const { result } = renderHook(() => useLogViewState());
    expect(result.current.state).toEqual({ viewMode: 'flat' });
  });

  it('derives state from the URL query string', () => {
    nav.params = new URLSearchParams('view=grouped&severity=ERROR,FATAL');
    const { result } = renderHook(() => useLogViewState());
    expect(result.current.state.viewMode).toBe('grouped');
    expect(result.current.state.severity).toEqual(['ERROR', 'FATAL']);
  });

  it('writes the serialized state to the URL via router.replace', () => {
    const { result } = renderHook(() => useLogViewState());
    act(() => result.current.setViewMode('grouped'));
    expect(nav.replace).toHaveBeenCalledWith('/?view=grouped', { scroll: false });
  });

  it('merges partial updates onto the current state', () => {
    nav.params = new URLSearchParams('view=grouped');
    const { result } = renderHook(() => useLogViewState());
    act(() => result.current.update({ severity: ['ERROR'] }));
    expect(nav.replace).toHaveBeenCalledWith('/?view=grouped&severity=ERROR', { scroll: false });
  });

  it('drops the query string when returning to defaults', () => {
    nav.params = new URLSearchParams('view=grouped');
    const { result } = renderHook(() => useLogViewState());
    act(() => result.current.setViewMode('flat'));
    expect(nav.replace).toHaveBeenCalledWith('/', { scroll: false });
  });
});

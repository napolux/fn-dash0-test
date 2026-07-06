'use client';

import { useCallback, useMemo } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  parseViewState,
  serializeViewState,
  type LogViewState,
  type ViewMode,
} from '@/lib/viewState';

export interface UseLogViewState {
  state: LogViewState;
  /** Merge a partial update into the current state. */
  update: (patch: Partial<LogViewState>) => void;
  setViewMode: (viewMode: ViewMode) => void;
}

/**
 * Single owner of the log view's state, backed by the URL query string so views are
 * shareable and survive reloads. Components read and mutate view state only through
 * this hook, never touching the URL directly.
 *
 * State is derived from `useSearchParams` via `parseViewState`; mutations serialize
 * back with `serializeViewState` and `router.replace` (no history spam, no scroll
 * jump). Consumers of this hook must be rendered inside a `<Suspense>` boundary, as
 * `useSearchParams` requires.
 */
export function useLogViewState(): UseLogViewState {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const state = useMemo(
    () => parseViewState(new URLSearchParams(searchParams.toString())),
    [searchParams],
  );

  const commit = useCallback(
    (next: LogViewState) => {
      const query = serializeViewState(next).toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [router, pathname],
  );

  const update = useCallback(
    (patch: Partial<LogViewState>) => commit({ ...state, ...patch }),
    [commit, state],
  );

  const setViewMode = useCallback((viewMode: ViewMode) => update({ viewMode }), [update]);

  return useMemo(() => ({ state, update, setViewMode }), [state, update, setViewMode]);
}

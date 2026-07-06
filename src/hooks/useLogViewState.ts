'use client';

import { useCallback, useMemo, useState } from 'react';
import { DEFAULT_VIEW_STATE, type LogViewState, type ViewMode } from '@/lib/viewState';

export interface UseLogViewState {
  state: LogViewState;
  /** Merge a partial update into the current state. */
  update: (patch: Partial<LogViewState>) => void;
  setViewMode: (viewMode: ViewMode) => void;
}

/**
 * Single owner of the log view's state. Components read and mutate view state only
 * through here, never touching the URL directly.
 *
 * Today the state lives in React state. To make it URL-addressable later, swap the
 * internals to `useSearchParams()` (seed via `parseViewState`) + `router.replace(
 * pathname + '?' + serializeViewState(next))` — no caller changes. `serializeViewState`
 * / `parseViewState` in `@/lib/viewState` already define that contract.
 */
export function useLogViewState(
  initial: LogViewState = DEFAULT_VIEW_STATE,
): UseLogViewState {
  const [state, setState] = useState<LogViewState>(initial);

  const update = useCallback((patch: Partial<LogViewState>) => {
    setState((prev) => ({ ...prev, ...patch }));
  }, []);

  const setViewMode = useCallback(
    (viewMode: ViewMode) => update({ viewMode }),
    [update],
  );

  return useMemo(() => ({ state, update, setViewMode }), [state, update, setViewMode]);
}

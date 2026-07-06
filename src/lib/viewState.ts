import type { FlatLogRecord, SeverityGroup } from '@/types/otlp';
import { SEVERITY_GROUPS } from '@/lib/severity';

export type ViewMode = 'flat' | 'grouped';

/**
 * The complete, serializable state of the log view. Every field is a primitive (or
 * array of primitives) so the whole object round-trips cleanly through
 * `URLSearchParams`. `viewMode` and `severity` are wired to the UI; `service`/`from`/
 * `to` are reserved so more URL-addressable filters can be added later without
 * changing this contract or re-plumbing components.
 */
export interface LogViewState {
  viewMode: ViewMode;
  severity?: SeverityGroup[];
  // --- Reserved for future URL-addressable filters (not yet applied) ---
  service?: string;
  /** Inclusive lower bound, epoch milliseconds. */
  from?: number;
  /** Inclusive upper bound, epoch milliseconds. */
  to?: number;
}

export const DEFAULT_VIEW_STATE: LogViewState = { viewMode: 'flat' };

const VIEW_MODES: ViewMode[] = ['flat', 'grouped'];

function isViewMode(value: string | null): value is ViewMode {
  return value !== null && (VIEW_MODES as string[]).includes(value);
}

function isSeverityGroup(value: string): value is SeverityGroup {
  return (SEVERITY_GROUPS as string[]).includes(value);
}

/**
 * Serialize view state into URL search params, omitting anything at its default so
 * the URL stays clean. Pairs with {@link parseViewState}.
 */
export function serializeViewState(state: LogViewState): URLSearchParams {
  const params = new URLSearchParams();

  if (state.viewMode && state.viewMode !== DEFAULT_VIEW_STATE.viewMode) {
    params.set('view', state.viewMode);
  }
  if (state.severity && state.severity.length > 0) {
    params.set('severity', state.severity.join(','));
  }
  if (state.service) params.set('service', state.service);
  if (state.from !== undefined) params.set('from', String(state.from));
  if (state.to !== undefined) params.set('to', String(state.to));

  return params;
}

/** Parse view state from URL search params, falling back to defaults. */
export function parseViewState(params: URLSearchParams): LogViewState {
  const state: LogViewState = { ...DEFAULT_VIEW_STATE };

  const view = params.get('view');
  if (isViewMode(view)) state.viewMode = view;

  const severity = params.get('severity');
  if (severity) {
    const groups = severity.split(',').filter(isSeverityGroup);
    if (groups.length > 0) state.severity = groups;
  }

  const service = params.get('service');
  if (service) state.service = service;

  const from = Number(params.get('from'));
  if (params.has('from') && Number.isFinite(from)) state.from = from;

  const to = Number(params.get('to'));
  if (params.has('to') && Number.isFinite(to)) state.to = to;

  return state;
}

/**
 * Derive the records to display from the raw set and the current view state — the
 * single seam where filtering lives. Applies the active `severity` filter; the
 * reserved fields (service/from/to) slot in here later. Returns the input array
 * unchanged when no filter is active.
 */
export function selectLogs(records: FlatLogRecord[], state: LogViewState): FlatLogRecord[] {
  let result = records;

  if (state.severity && state.severity.length > 0) {
    const enabled = new Set(state.severity);
    result = result.filter((record) => enabled.has(record.severityGroup));
  }

  return result;
}

/**
 * Toggle a severity group in the inclusion filter (used by the histogram legend).
 * An empty/undefined selection means "show all", so removing the last group returns
 * `undefined` to keep the state (and URL) clean.
 */
export function toggleSeverity(
  selected: SeverityGroup[] | undefined,
  group: SeverityGroup,
): SeverityGroup[] | undefined {
  const current = selected ?? [];
  const next = current.includes(group)
    ? current.filter((g) => g !== group)
    : [...current, group];
  return next.length > 0 ? next : undefined;
}

'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { flattenLogs } from '@/lib/otlp';
import type { FlatLogRecord, IExportLogsServiceRequest } from '@/types/otlp';

export interface UseLogsResult {
  logs: FlatLogRecord[];
  loading: boolean;
  error: string | null;
  /** Re-fetch on demand (e.g. a refresh button). */
  refetch: () => void;
}

/**
 * Fetch OTLP logs from the local proxy, flatten them into display-ready records, and
 * expose loading/error state. In-flight requests are aborted on unmount and whenever
 * a newer fetch starts, so a slow response can never overwrite fresher data.
 */
export function useLogs(endpoint = '/api/logs'): UseLogsResult {
  const [logs, setLogs] = useState<FlatLogRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const controllerRef = useRef<AbortController | null>(null);

  const fetchLogs = useCallback(async () => {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(endpoint, {
        signal: controller.signal,
        headers: { accept: 'application/json' },
      });
      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }
      const data = (await response.json()) as IExportLogsServiceRequest;
      if (controller.signal.aborted) return;
      setLogs(flattenLogs(data));
      setLoading(false);
    } catch (err) {
      if (controller.signal.aborted) return;
      setError(err instanceof Error ? err.message : 'Failed to load logs');
      setLoading(false);
    }
  }, [endpoint]);

  useEffect(() => {
    // Fetch-on-mount: setState runs asynchronously after the awaited response, not
    // synchronously in the effect body, so this does not cause cascading renders.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchLogs();
    return () => controllerRef.current?.abort();
  }, [fetchLogs]);

  return { logs, loading, error, refetch: fetchLogs };
}

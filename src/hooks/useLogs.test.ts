import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useLogs } from '@/hooks/useLogs';
import type { IExportLogsServiceRequest } from '@/types/otlp';

const sampleResponse: IExportLogsServiceRequest = {
  resourceLogs: [
    {
      resource: { attributes: [{ key: 'service.name', value: { stringValue: 'checkout' } }] },
      scopeLogs: [
        {
          logRecords: [
            {
              timeUnixNano: '1000000',
              severityNumber: 17,
              severityText: 'ERROR',
              body: { stringValue: 'boom' },
            },
          ],
        },
      ],
    },
  ],
};

function mockFetchOnce(response: Partial<Response>) {
  return vi.fn().mockResolvedValue({ ok: true, status: 200, ...response });
}

describe('useLogs', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('fetches, flattens, and exposes logs on success', async () => {
    vi.stubGlobal(
      'fetch',
      mockFetchOnce({ json: async () => sampleResponse }),
    );

    const { result } = renderHook(() => useLogs());
    expect(result.current.loading).toBe(true);

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBeNull();
    expect(result.current.logs).toHaveLength(1);
    expect(result.current.logs[0].body).toBe('boom');
    expect(result.current.logs[0].resource.serviceName).toBe('checkout');
  });

  it('surfaces an error state on a non-ok response', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 500 }));

    const { result } = renderHook(() => useLogs());
    await waitFor(() => expect(result.current.error).toContain('500'));
    expect(result.current.logs).toEqual([]);
  });

  it('surfaces an error state when fetch rejects', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network down')));

    const { result } = renderHook(() => useLogs());
    await waitFor(() => expect(result.current.error).toBe('network down'));
  });

  it('re-fetches on demand via refetch', async () => {
    const fetchMock = mockFetchOnce({ json: async () => sampleResponse });
    vi.stubGlobal('fetch', fetchMock);

    const { result } = renderHook(() => useLogs());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(fetchMock).toHaveBeenCalledTimes(1);

    result.current.refetch();
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
  });

  it('aborts the in-flight request on unmount', async () => {
    const abortSpy = vi.spyOn(AbortController.prototype, 'abort');
    vi.stubGlobal('fetch', mockFetchOnce({ json: async () => sampleResponse }));

    const { unmount } = renderHook(() => useLogs());
    unmount();
    expect(abortSpy).toHaveBeenCalled();
  });
});

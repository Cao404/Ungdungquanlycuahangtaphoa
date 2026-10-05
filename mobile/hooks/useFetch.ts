import { useState, useEffect, useCallback, useRef } from 'react';
import { getApiErrorMessage } from '../services/api';

// Hook generic: fetch data + trạng thái loading/error + hàm refetch
export function useFetch<T>(fetcher: () => Promise<T>, deps: unknown[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestSequence = useRef(0);

  const fetch = useCallback(async (showLoading = true) => {
    const requestId = ++requestSequence.current;
    if (showLoading) setLoading(true);
    if (showLoading) setError(null);
    try {
      const result = await fetcher();
      if (requestId === requestSequence.current) setData(result);
    } catch (e: any) {
      if (showLoading && requestId === requestSequence.current) setError(getApiErrorMessage(e, 'Không thể tải dữ liệu.'));
    } finally {
      if (requestId === requestSequence.current) setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => { void fetch(); }, [fetch]);

  const refetch = useCallback(() => fetch(true), [fetch]);
  const refreshSilently = useCallback(() => fetch(false), [fetch]);
  return { data, loading, error, refetch, refreshSilently };
}

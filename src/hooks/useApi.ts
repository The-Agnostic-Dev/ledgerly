import { useCallback, useEffect, useState } from 'react';

interface ApiState<T> {
  data: T | undefined;
  error: Error | undefined;
  loading: boolean;
}

/**
 * Runs `load` whenever `key` changes and tracks loading and error state.
 * Call `reload` after a mutation to fetch again.
 */
export function useApi<T>(key: string, load: () => Promise<T>) {
  const [state, setState] = useState<ApiState<T>>({ data: undefined, error: undefined, loading: true });
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setState((s) => ({ ...s, loading: true, error: undefined }));
    load().then(
      (data) => !cancelled && setState({ data, error: undefined, loading: false }),
      (error: Error) => !cancelled && setState({ data: undefined, error, loading: false }),
    );
    return () => {
      cancelled = true;
    };
    // `load` is recreated on every render; `key` identifies the request.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, version]);

  const reload = useCallback(() => setVersion((v) => v + 1), []);
  return { ...state, reload };
}

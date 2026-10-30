import { useCallback, useEffect, useState } from 'react';
import { api } from '../api/client.js';

// Loads a path and keeps the latest response; a newer path discards older responses.
export function useFetch(path) {
  const [state, setState] = useState({ data: null, loading: true, error: null });
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let ignore = false;
    setState((current) => ({ ...current, loading: true, error: null }));
    api
      .get(path)
      .then((data) => !ignore && setState({ data, loading: false, error: null }))
      .catch((error) => !ignore && setState({ data: null, loading: false, error }));
    return () => {
      ignore = true;
    };
  }, [path, version]);

  const reload = useCallback(() => setVersion((v) => v + 1), []);
  return { ...state, reload };
}

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api, toQuery } from '../api/client.js';
import EmptyState from './EmptyState.jsx';
import ErrorState from './ErrorState.jsx';
import FilterBar from './FilterBar.jsx';
import Spinner from './Spinner.jsx';
import TaskCard from './TaskCard.jsx';
import TaskForm from './TaskForm.jsx';

const FILTER_KEYS = ['q', 'project', 'assignee', 'status', 'deadlineFrom', 'deadlineTo', 'overdue'];
const PAGE_SIZE = 50;

// Task list with search and filters kept in the URL. `fixed` filters are set by the page.
export default function TaskListView({ fixed = {}, emptyTitle = 'No tasks yet', emptyMessage, defaultProject, onChanged }) {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const [state, setState] = useState({ tasks: [], total: 0, loading: true, error: null });
  const [page, setPage] = useState(1);
  const [version, setVersion] = useState(0);
  const [creating, setCreating] = useState(false);

  const fixedKey = JSON.stringify(fixed);
  const filters = useMemo(() => {
    const values = {};
    for (const key of FILTER_KEYS) if (params.get(key)) values[key] = params.get(key);
    return { ...values, ...JSON.parse(fixedKey) };
  }, [params, fixedKey]);
  const filterKey = JSON.stringify(filters);

  useEffect(() => setPage(1), [filterKey]);

  useEffect(() => {
    let ignore = false;
    setState((s) => ({ ...s, loading: true, error: null }));
    api
      .get(`/tasks${toQuery({ ...JSON.parse(filterKey), page, limit: PAGE_SIZE })}`)
      .then((data) => {
        if (ignore) return;
        setState((s) => ({
          tasks: page === 1 ? data.tasks : [...s.tasks, ...data.tasks],
          total: data.total,
          loading: false,
          error: null,
        }));
      })
      .catch((error) => !ignore && setState((s) => ({ ...s, loading: false, error })));
    return () => {
      ignore = true;
    };
  }, [filterKey, page, version]);

  const setFilter = useCallback(
    (key, value) => {
      setParams(
        (current) => {
          const next = new URLSearchParams(current);
          if (value) next.set(key, value);
          else next.delete(key);
          return next;
        },
        { replace: true },
      );
    },
    [setParams],
  );

  const hidden = Object.keys(fixed);
  const hasFilters = Object.keys(filters).some((key) => !hidden.includes(key));
  const { tasks, total, loading, error } = state;
  const showInitialSpinner = loading && page === 1 && tasks.length === 0;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-2">
        <p aria-live="polite" className="text-sm text-slate-600">
          {!loading && !error && `${total} task${total === 1 ? '' : 's'}`}
        </p>
        <button type="button" className="btn-primary" onClick={() => setCreating(true)}>
          New task
        </button>
      </div>

      <FilterBar filters={filters} onChange={setFilter} onClear={() => setParams({}, { replace: true })} hidden={hidden} />

      {showInitialSpinner && <Spinner />}
      {error && <ErrorState error={error} onRetry={() => setVersion((v) => v + 1)} />}
      {!loading && !error && tasks.length === 0 && (
        <EmptyState
          title={hasFilters ? 'No tasks match these filters' : emptyTitle}
          message={hasFilters ? 'Try changing or clearing the filters.' : emptyMessage}
        />
      )}
      {!error && tasks.length > 0 && (
        <div className={`space-y-2 ${loading && page === 1 ? 'opacity-60' : ''}`}>
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      )}
      {!error && tasks.length < total && (
        <div className="mt-4 text-center">
          <button type="button" className="btn-secondary" disabled={loading} onClick={() => setPage((p) => p + 1)}>
            {loading ? 'Loading…' : 'Load more'}
          </button>
        </div>
      )}

      {creating && (
        <TaskForm
          defaultProject={defaultProject}
          onClose={() => setCreating(false)}
          onSaved={(task) => {
            setCreating(false);
            onChanged?.();
            navigate(`/tasks/${task.id}`);
          }}
        />
      )}
    </div>
  );
}

import { useEffect, useState } from 'react';
import { useFetch } from '../hooks/useFetch.js';
import { TASK_STATUSES, UNASSIGNED } from '../utils/constants.js';

// `hidden` lists filters fixed by the page, such as the assignee on My Tasks.
export default function FilterBar({ filters, onChange, onClear, hidden = [] }) {
  const users = useFetch('/users');
  const projects = useFetch('/projects');
  const [search, setSearch] = useState(filters.q ?? '');

  useEffect(() => setSearch(filters.q ?? ''), [filters.q]);

  useEffect(() => {
    if (search === (filters.q ?? '')) return undefined;
    const timer = setTimeout(() => onChange('q', search), 300);
    return () => clearTimeout(timer);
  }, [search, filters.q, onChange]);

  const select = (key) => ({ value: filters[key] ?? '', onChange: (e) => onChange(key, e.target.value) });
  const active = Object.keys(filters).some((key) => filters[key] && !hidden.includes(key));

  return (
    <div className="card mb-4 space-y-3 p-3">
      <input
        type="search"
        aria-label="Search tasks by name"
        placeholder="Search tasks by name"
        className="input"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {!hidden.includes('project') && (
          <select aria-label="Filter by project" className="input" {...select('project')}>
            <option value="">All projects</option>
            <option value="none">No project</option>
            {projects.data?.projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        )}
        {!hidden.includes('assignee') && (
          <select aria-label="Filter by team member" className="input" {...select('assignee')}>
            <option value="">All team members</option>
            <option value={UNASSIGNED}>Unassigned</option>
            {users.data?.users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>
        )}
        <select aria-label="Filter by status" className="input" {...select('status')}>
          <option value="">All statuses</option>
          {TASK_STATUSES.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-600">
        <label className="flex items-center gap-2">
          Due from
          <input type="date" className="input w-auto" {...select('deadlineFrom')} />
        </label>
        <label className="flex items-center gap-2">
          to
          <input type="date" className="input w-auto" {...select('deadlineTo')} />
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={filters.overdue === 'true'}
            onChange={(e) => onChange('overdue', e.target.checked ? 'true' : '')}
          />
          Overdue only
        </label>
        {active && (
          <button type="button" className="link cursor-pointer" onClick={onClear}>
            Clear filters
          </button>
        )}
      </div>
    </div>
  );
}

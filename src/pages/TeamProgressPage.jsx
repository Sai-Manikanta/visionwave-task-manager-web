import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { toQuery } from '../api/client.js';
import EmptyState from '../components/EmptyState.jsx';
import ErrorState from '../components/ErrorState.jsx';
import { CompletedChart, MembersChart, SERIES } from '../components/ReportCharts.jsx';
import Spinner from '../components/Spinner.jsx';
import StatusBadge, { OverdueBadge } from '../components/StatusBadge.jsx';
import { useFetch } from '../hooks/useFetch.js';
import { UNASSIGNED } from '../utils/constants.js';
import { addDays, formatDay } from '../utils/format.js';

function periodLabel(report) {
  if (report.period === 'daily') return formatDay(report.date, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  return `${formatDay(report.first, { day: 'numeric', month: 'short' })} – ${formatDay(report.last)}`;
}

function TaskGroup({ label, tasks }) {
  if (tasks.length === 0) return null;
  return (
    <section>
      <h3 className="section-title mb-2">
        {label} <span className="font-normal text-slate-500">({tasks.length})</span>
      </h3>
      <ul className="card divide-y divide-slate-100">
        {tasks.map((task) => (
          <li key={task.id} className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 px-4 py-3">
            <div className="min-w-0">
              <Link to={`/tasks/${task.id}`} className="link text-sm font-medium break-words">
                {task.title}
              </Link>
              <p className="text-xs text-slate-500">
                {task.project?.name ?? 'No project'} · {task.assignee?.name ?? 'Unassigned'} · Due {formatDay(task.deadline)}
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              {task.overdue && <OverdueBadge />}
              <StatusBadge status={task.status} />
              <span className="w-9 text-right text-xs text-slate-600 tabular-nums">{task.completionPercent}%</span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function TeamProgressPage() {
  const [params, setParams] = useSearchParams();
  const [member, setMember] = useState('');
  const period = params.get('period') === 'weekly' ? 'weekly' : 'daily';
  const date = params.get('date') ?? '';

  const { data, loading, error, reload } = useFetch(`/reports/${period}${toQuery({ date })}`);
  const report = data?.report;

  const go = (next) => setParams((current) => {
    const merged = new URLSearchParams(current);
    for (const [key, value] of Object.entries(next)) {
      if (value) merged.set(key, value);
      else merged.delete(key);
    }
    return merged;
  }, { replace: true });

  const step = period === 'weekly' ? 7 : 1;
  const atLatest = report && data.today <= report.last;
  const onlyMember = (tasks) => (member ? tasks.filter((t) => (t.assignee?.id ?? UNASSIGNED) === member) : tasks);

  return (
    <>
      <h1 className="page-title mb-4">Team Progress</h1>

      <div className="card mb-4 flex flex-wrap items-center gap-3 p-3">
        <div role="group" aria-label="Report period" className="flex rounded-md border border-slate-300 p-0.5">
          {[['daily', 'Day'], ['weekly', 'Week']].map(([value, label]) => (
            <button
              key={value}
              type="button"
              aria-pressed={period === value}
              className={`cursor-pointer rounded px-3 py-1.5 text-sm font-medium ${period === value ? 'bg-brand-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
              onClick={() => go({ period: value === 'daily' ? '' : value })}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1">
          <button type="button" aria-label={`Previous ${period === 'weekly' ? 'week' : 'day'}`} className="btn-secondary" disabled={!report} onClick={() => go({ date: addDays(report.date, -step) })}>
            ‹
          </button>
          <input
            type="date"
            aria-label="Report date"
            className="input w-auto"
            max={data?.today}
            value={report?.date ?? date}
            onChange={(e) => e.target.value && go({ date: e.target.value })}
          />
          <button type="button" aria-label={`Next ${period === 'weekly' ? 'week' : 'day'}`} className="btn-secondary" disabled={!report || atLatest} onClick={() => go({ date: addDays(report.date, step) })}>
            ›
          </button>
        </div>
        {report && !atLatest && (
          <button type="button" className="link cursor-pointer text-sm" onClick={() => go({ date: '' })}>
            {period === 'weekly' ? 'This week' : 'Today'}
          </button>
        )}
        {report && (
          <select aria-label="Filter by team member" className="input w-auto sm:ml-auto" value={member} onChange={(e) => setMember(e.target.value)}>
            <option value="">All team members</option>
            {report.members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {loading && !report && <Spinner />}
      {error && <ErrorState error={error} onRetry={reload} />}
      {report && (
        <div className={`space-y-6 ${loading ? 'opacity-60' : ''}`}>
          <p className="text-sm font-medium text-slate-700">{periodLabel(report)}</p>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {SERIES.map((series) => (
              <div key={series.key} className="card px-4 py-3">
                <p className="text-sm text-slate-500">{series.label}</p>
                <p className="mt-1 text-2xl font-semibold tabular-nums">
                  {onlyMember(report.tasks[series.key]).length}
                </p>
              </div>
            ))}
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <CompletedChart
              series={report.completedSeries}
              title={period === 'weekly' ? 'Tasks completed each day' : 'Tasks completed, last 7 days'}
            />
            <MembersChart members={report.members} />
          </div>

          <section>
            <h2 className="section-title mb-2">Team members</h2>
            <div className="card overflow-x-auto">
              <table className="w-full min-w-[32rem] text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-xs text-slate-500">
                    <th scope="col" className="px-4 py-2 font-medium">Name</th>
                    {SERIES.map((series) => (
                      <th key={series.key} scope="col" className="px-3 py-2 text-right font-medium">{series.label}</th>
                    ))}
                    <th scope="col" className="px-4 py-2 text-right font-medium">Avg. completion</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {report.members.map((m) => (
                    <tr key={m.id} className={member === m.id ? 'bg-brand-50' : undefined}>
                      <th scope="row" className="px-4 py-2 text-left font-medium text-slate-800">{m.name}</th>
                      {SERIES.map((series) => (
                        <td key={series.key} className="px-3 py-2 text-right tabular-nums">{m[series.key]}</td>
                      ))}
                      <td className="px-4 py-2 text-right tabular-nums">{m.averagePercent}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {SERIES.every((series) => onlyMember(report.tasks[series.key]).length === 0) ? (
            <EmptyState title="No tasks for this period" message="Choose another date, or a different team member." />
          ) : (
            <div className="space-y-5">
              {SERIES.map((series) => (
                <TaskGroup key={series.key} label={series.label} tasks={onlyMember(report.tasks[series.key])} />
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}

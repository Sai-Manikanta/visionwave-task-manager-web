import { Link } from 'react-router-dom';
import EmptyState from '../components/EmptyState.jsx';
import ErrorState from '../components/ErrorState.jsx';
import Spinner from '../components/Spinner.jsx';
import StatCard from '../components/StatCard.jsx';
import { useFetch } from '../hooks/useFetch.js';
import { formatDateTime, formatDay } from '../utils/format.js';

export default function DashboardPage() {
  const { data, loading, error, reload } = useFetch('/dashboard');

  return (
    <>
      <div className="mb-4">
        <h1 className="page-title">Dashboard</h1>
        {data && <p className="text-sm text-slate-500">{formatDay(data.today, { weekday: 'long', day: 'numeric', month: 'long' })}</p>}
      </div>

      {loading && !data && <Spinner />}
      {error && <ErrorState error={error} onRetry={reload} />}
      {data && (
        <>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-7">
            <StatCard label="Active tasks" value={data.cards.activeTasks} to="/tasks" />
            <StatCard label="Completed today" value={data.cards.completedToday} to="/team-progress" />
            <StatCard label="In progress" value={data.cards.inProgress} to="/tasks?status=In+Progress" />
            <StatCard label="Pending" value={data.cards.pending} to="/tasks?status=To+Do" />
            <StatCard label="Overdue" value={data.cards.overdue} to="/tasks?overdue=true" tone={data.cards.overdue ? 'text-red-700' : undefined} />
            <StatCard label="Unassigned" value={data.cards.unassigned} to="/tasks?assignee=none" />
            <StatCard label="Active projects" value={data.cards.activeProjects} to="/projects" />
          </div>

          <h2 className="section-title mt-6 mb-3">Recent task updates</h2>
          {data.recentUpdates.length === 0 ? (
            <EmptyState title="No updates yet" message="Notes and status changes on tasks will show up here." />
          ) : (
            <ul className="card divide-y divide-slate-100">
              {data.recentUpdates.map((update) => (
                <li key={update.id} className="px-4 py-3">
                  <Link to={`/tasks/${update.taskId}`} className="link text-sm font-medium break-words">
                    {update.taskTitle}
                  </Link>
                  <p className="mt-0.5 line-clamp-2 text-sm break-words text-slate-700">{update.text}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {update.author} · {formatDateTime(update.createdAt)}
                    {update.percent !== null && ` · ${update.percent}%`}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </>
  );
}

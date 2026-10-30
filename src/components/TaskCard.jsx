import { Link } from 'react-router-dom';
import { formatDay } from '../utils/format.js';
import ProgressBar from './ProgressBar.jsx';
import StatusBadge, { OverdueBadge } from './StatusBadge.jsx';

const PRIORITY_TONE = { High: 'text-red-700', Medium: 'text-slate-600', Low: 'text-slate-500' };

export default function TaskCard({ task }) {
  return (
    <Link to={`/tasks/${task.id}`} className="card block p-4 hover:border-slate-300">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h3 className="min-w-0 font-medium break-words text-slate-900">{task.title}</h3>
        <div className="flex items-center gap-1.5">
          {task.overdue && <OverdueBadge />}
          <StatusBadge status={task.status} />
        </div>
      </div>
      <p className="mt-1 text-sm text-slate-600">
        {task.project?.name ?? 'No project'} · {task.assignee?.name ?? 'Unassigned'}
      </p>
      <div className="mt-3 grid items-center gap-3 sm:grid-cols-[1fr_auto]">
        <ProgressBar value={task.completionPercent} label={`${task.title} progress`} />
        <p className="text-xs text-slate-500">
          <span className={`font-medium ${PRIORITY_TONE[task.priority]}`}>{task.priority}</span> · Due {formatDay(task.deadline)}
        </p>
      </div>
    </Link>
  );
}

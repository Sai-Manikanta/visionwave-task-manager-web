const STYLES = {
  'To Do': { badge: 'bg-slate-100 text-slate-700', dot: 'bg-slate-400' },
  'In Progress': { badge: 'bg-brand-50 text-brand-700', dot: 'bg-brand-600' },
  'In Review': { badge: 'bg-amber-50 text-amber-800', dot: 'bg-amber-500' },
  Completed: { badge: 'bg-emerald-50 text-emerald-800', dot: 'bg-emerald-600' },
};

export default function StatusBadge({ status }) {
  const style = STYLES[status] ?? STYLES['To Do'];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap ${style.badge}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
      {status}
    </span>
  );
}

export function OverdueBadge() {
  return <span className="rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium whitespace-nowrap text-red-700">Overdue</span>;
}

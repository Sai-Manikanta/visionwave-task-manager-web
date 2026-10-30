import { Link } from 'react-router-dom';

export default function StatCard({ label, value, to, tone = 'text-slate-900' }) {
  return (
    <Link to={to} className="card block px-4 py-4 hover:border-slate-300">
      <p className="text-sm text-slate-500">{label}</p>
      <p className={`mt-1 text-2xl font-semibold tabular-nums ${tone}`}>{value}</p>
    </Link>
  );
}

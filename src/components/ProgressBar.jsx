export default function ProgressBar({ value, label = 'Progress' }) {
  return (
    <div className="flex items-center gap-2">
      <div
        role="progressbar"
        aria-label={label}
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={100}
        className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-200"
      >
        <div className="h-full rounded-full bg-brand-600" style={{ width: `${value}%` }} />
      </div>
      <span className="w-9 text-right text-xs text-slate-600 tabular-nums">{value}%</span>
    </div>
  );
}

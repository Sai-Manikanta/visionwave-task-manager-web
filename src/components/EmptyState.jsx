export default function EmptyState({ title, message, action }) {
  return (
    <div className="card px-6 py-12 text-center">
      <p className="font-medium text-slate-900">{title}</p>
      {message && <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">{message}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

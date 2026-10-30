export default function Spinner({ className = 'py-16' }) {
  return (
    <div role="status" aria-label="Loading" className={`flex items-center justify-center ${className}`}>
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-brand-600" />
    </div>
  );
}

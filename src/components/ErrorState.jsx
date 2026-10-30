export default function ErrorState({ error, onRetry }) {
  return (
    <div role="alert" className="card px-6 py-12 text-center">
      <p className="font-medium text-slate-900">This couldn't be loaded</p>
      <p className="mt-1 text-sm text-slate-500">{error.message}</p>
      {onRetry && (
        <button type="button" className="btn-secondary mt-4" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  );
}

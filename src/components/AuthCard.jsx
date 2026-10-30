export default function AuthCard({ title, children, footer }) {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm">
        <img src="/logo.webp" alt="Vision Wave Tech" width="817" height="203" className="mx-auto mb-4 h-14 w-auto" />
        <h1 className="mb-6 text-center text-xl font-semibold">{title}</h1>
        <div className="card p-5">{children}</div>
        <p className="mt-4 text-center text-sm text-slate-600">{footer}</p>
      </div>
    </main>
  );
}

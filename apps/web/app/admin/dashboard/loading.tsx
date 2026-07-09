export default function LoadingAdminDashboard() {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 p-6">
      <div className="h-8 w-64 animate-pulse rounded bg-muted" />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 9 }).map((_, idx) => (
          <div key={idx} className="h-24 animate-pulse rounded-md border bg-muted/40" />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {Array.from({ length: 5 }).map((_, idx) => (
          <div key={idx} className="h-56 animate-pulse rounded-md border bg-muted/40" />
        ))}
      </div>
    </div>
  );
}

export default function LoadingMerchantDashboard() {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-4 p-6">
      <div className="h-8 w-56 animate-pulse rounded bg-muted" />
      <div className="h-24 animate-pulse rounded-md border bg-muted/40" />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, idx) => (
          <div key={idx} className="h-24 animate-pulse rounded-md border bg-muted/40" />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div key={idx} className="h-52 animate-pulse rounded-md border bg-muted/40" />
        ))}
      </div>
    </div>
  );
}

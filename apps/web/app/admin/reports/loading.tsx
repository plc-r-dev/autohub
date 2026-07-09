export default function LoadingAdminReports() {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 p-6">
      <div className="h-8 w-64 animate-pulse rounded bg-muted" />
      <div className="h-20 animate-pulse rounded-md border bg-muted/40" />
      {Array.from({ length: 3 }).map((_, idx) => (
        <div key={idx} className="h-56 animate-pulse rounded-md border bg-muted/40" />
      ))}
    </div>
  );
}

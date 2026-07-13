export default function LoadingServiceStoreDashboard() {
  return (
    <div className="min-h-svh bg-background">
      <div className="mx-auto flex w-full max-w-7xl gap-6 p-4 md:p-6 lg:p-8">
        <aside className="hidden w-56 shrink-0 lg:block">
          <div className="sticky top-6 flex flex-col gap-6">
            <div className="px-3">
              <div className="h-3 w-16 animate-pulse rounded bg-[#dce5ee]" />
              <div className="mt-2 h-6 w-24 animate-pulse rounded bg-[#dce5ee]" />
            </div>
            <div className="flex flex-col gap-2 px-2">
              {Array.from({ length: 7 }).map((_, idx) => (
                <div key={idx} className="h-9 animate-pulse rounded-xl bg-[#dce5ee]/60" />
              ))}
            </div>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <div className="mb-6">
            <div className="h-8 w-48 animate-pulse rounded bg-[#dce5ee]" />
            <div className="mt-2 h-4 w-64 animate-pulse rounded bg-[#dce5ee]/70" />
          </div>

          <div className="flex flex-col gap-6">
            <div className="h-24 animate-pulse rounded-2xl border border-[#dce5ee] bg-white" />
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {Array.from({ length: 4 }).map((_, idx) => (
                <div
                  key={idx}
                  className="h-24 animate-pulse rounded-2xl border border-[#dce5ee] bg-white"
                />
              ))}
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, idx) => (
                <div
                  key={idx}
                  className="h-24 animate-pulse rounded-2xl border border-[#dce5ee] bg-white"
                />
              ))}
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              {Array.from({ length: 4 }).map((_, idx) => (
                <div
                  key={idx}
                  className="h-52 animate-pulse rounded-2xl border border-[#dce5ee] bg-white"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

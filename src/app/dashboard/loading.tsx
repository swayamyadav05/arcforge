export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-forge-bg-deepest text-forge-white">
      <div className="sticky top-0 z-20 border-b border-white/5 bg-forge-bg-deepest/80 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-screen-2xl items-center justify-between px-6 py-5">
          <div className="h-6 w-28 animate-pulse rounded bg-purple-950/40" />
          <div className="h-8 w-32 animate-pulse rounded bg-purple-950/40" />
        </div>
      </div>

      <div className="container mx-auto px-6 py-10">
        <div className="mb-12 text-center">
          <div className="mx-auto mb-3 h-3 w-20 animate-pulse rounded bg-purple-950/40" />
          <div className="mx-auto mb-4 h-14 w-72 animate-pulse rounded bg-purple-950/40" />
          <div className="mx-auto h-5 w-80 animate-pulse rounded bg-purple-950/40" />
        </div>

        <div className="mx-auto grid max-w-7xl gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((item) => (
            <div
              key={item}
              className="rounded-xl border border-purple-500/20 bg-purple-950/40 p-6">
              <div className="mb-4 flex items-start justify-between">
                <div className="h-3 w-36 animate-pulse rounded bg-purple-900/50" />
                <div className="h-6 w-20 animate-pulse rounded-full bg-purple-900/50" />
              </div>
              <div className="mb-3 h-8 w-48 animate-pulse rounded bg-purple-900/50" />
              <div className="mb-4 h-4 w-32 animate-pulse rounded bg-purple-900/50" />
              <div className="mb-6 h-16 w-full animate-pulse rounded bg-purple-900/50" />
              <div className="h-12 w-full animate-pulse rounded bg-purple-900/50" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

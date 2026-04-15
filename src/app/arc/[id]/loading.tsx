export default function ArcLoading() {
  return (
    <main className="-mt-18 min-h-screen bg-forge-bg-deepest text-[#EEEDFE] px-6 py-12">
      <div className="mx-auto max-w-4xl animate-pulse">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 h-3 w-56 rounded bg-purple-950/40" />
          <div className="mx-auto mb-6 h-14 w-80 rounded bg-purple-950/40" />
          <div className="mx-auto h-8 w-44 rounded-full bg-purple-950/40" />
        </div>

        <div className="flex justify-center">
          <div className="h-140 w-100 rounded-xl border border-purple-500/20 bg-purple-950/40" />
        </div>
      </div>
    </main>
  );
}

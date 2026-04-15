"use client";

import Link from "next/link";

interface DashboardErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function DashboardError({
  error: _error,
  reset,
}: DashboardErrorProps) {
  return (
    <main className="min-h-screen bg-forge-bg-deepest text-forge-white flex items-center justify-center px-6">
      <div className="w-full max-w-2xl rounded-2xl border border-purple-500/25 bg-purple-950/20 p-8 text-center">
        <h1
          className="mb-4 text-3xl md:text-4xl font-bold text-[#EEEDFE]"
          style={{ fontFamily: "var(--font-heading)" }}>
          Something went wrong loading your arc.
        </h1>
        <p className="mb-8 text-[#AFA9EC]">
          The forge is unstable right now. Try again or return home.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="rounded-xl bg-linear-to-r from-[#534AB7] to-[#6B5FD8] px-6 py-3 text-[#EEEDFE] transition-all duration-300 hover:from-[#6B5FD8] hover:to-[#7F73E8]">
            Try again
          </button>
          <Link
            href="/"
            className="rounded-xl border border-purple-500/40 px-6 py-3 text-[#CBC5F7] transition-colors duration-300 hover:border-[#7F73E8] hover:text-[#EEEDFE] no-underline">
            Return home
          </Link>
        </div>
      </div>
    </main>
  );
}

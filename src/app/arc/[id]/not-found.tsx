import Link from "next/link";

export default function ArcNotFound() {
  return (
    <main className="min-h-screen bg-forge-bg-deepest text-forge-white flex items-center justify-center px-6">
      <div className="max-w-2xl text-center">
        <h1
          className="text-4xl md:text-5xl font-bold text-[#EEEDFE] mb-4"
          style={{ fontFamily: "var(--font-heading)" }}>
          This arc doesn&apos;t exist.
        </h1>
        <p className="text-[#AFA9EC] text-lg leading-relaxed mb-8">
          The story you&apos;re looking for hasn&apos;t been written —
          or was never real.
        </p>
        <Link
          href="/"
          className="inline-block bg-linear-to-r from-[#534AB7] to-[#6B5FD8] hover:from-[#6B5FD8] hover:to-[#7F73E8] text-[#EEEDFE] px-8 py-3 rounded-xl text-base font-medium transition-all duration-300 no-underline">
          Return home
        </Link>
      </div>
    </main>
  );
}

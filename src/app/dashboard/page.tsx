// src/app/dashboard/page.tsx
// Protected server component — reads the session server-side
// and redirects to /login if the user isn't authenticated.
// This is the correct pattern for Better Auth with Next.js App Router.

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { GeneratedArc } from "@/types/arc";
import ClaimArcForm from "@/components/dashboard/ClaimArcForm";

export default async function DashboardPage() {
  // Better Auth session check in server components uses
  // the headers() function to read the session cookie.
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Not authenticated — redirect to login.
  // The callbackURL tells the login page where to send
  // the user after they sign in successfully.
  if (!session) {
    redirect("/login?callbackURL=/dashboard");
  }

  const user = session.user;

  // Fetch all arcs belonging to this user, ordered by
  // creation date ascending so episodes appear in order.
  // Episode 1 first, Episode 2 second, and so on.
  const arcs = await prisma.arc.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="min-h-screen bg-forge-bg-deepest text-[#EEEDFE] py-12 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <p className="text-xs uppercase tracking-[0.15em] text-purple-400 mb-2">
            Your arc
          </p>
          <h1 className="text-3xl font-bold font-heading text-[#EEEDFE]">
            {user.name || user.email}
          </h1>
          <p className="text-[#AFA9EC] text-sm mt-1">
            {arcs.length === 0
              ? "No episodes yet — forge your arc to begin."
              : `${arcs.length} episode${arcs.length === 1 ? "" : "s"} in your arc`}
          </p>
        </div>

        {/* Episodes list */}
        {arcs.length > 0 ? (
          <div className="space-y-4 mb-12">
            {arcs.map((arc, index) => {
              const arcData = arc.arcData as unknown as GeneratedArc;
              return (
                <Link
                  key={arc.id}
                  href={`/arc/${arc.id}?new=true`}
                  className="block no-underline">
                  <div
                    className="rounded-xl p-6 border transition-all duration-200 hover:border-purple-500/40"
                    style={{
                      background: "rgba(255, 255, 255, 0.03)",
                      borderColor: "rgba(255, 255, 255, 0.08)",
                    }}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        {/* Episode label */}
                        <p className="text-xs uppercase tracking-[0.15em] text-purple-400 mb-2">
                          Episode {String(index + 1).padStart(2, "0")}{" "}
                          ·{" "}
                          {index === 0
                            ? "The Awakening"
                            : "The Confrontation"}
                        </p>

                        {/* Character name */}
                        <h2 className="text-xl font-bold font-heading text-[#EEEDFE] mb-1">
                          {arcData.character_name}
                        </h2>

                        {/* Archetype */}
                        <p className="text-sm text-purple-300 mb-3">
                          {arcData.archetype}
                        </p>

                        {/* Opening quote — truncated */}
                        <p className="text-sm text-[#AFA9EC] italic leading-relaxed line-clamp-2">
                          &quot;{arcData.opening_episode_quote}&quot;
                        </p>
                      </div>

                      {/* Rarity badge */}
                      <div>
                        <span
                          className={`text-xs font-medium uppercase tracking-wider px-3 py-1 rounded-full border ${
                            arcData.rarity === "Legendary"
                              ? "bg-amber-500/20 border-amber-400/40 text-amber-300"
                              : arcData.rarity === "Mythic"
                                ? "bg-fuchsia-500/20 border-fuchsia-400/40 text-fuchsia-300"
                                : arcData.rarity === "Rare"
                                  ? "bg-blue-500/20 border-blue-400/40 text-blue-300"
                                  : "bg-slate-500/20 border-slate-400/40 text-slate-300"
                          }`}>
                          {arcData.rarity}
                        </span>
                      </div>
                    </div>

                    {/* Arc date */}
                    <p className="text-xs text-purple-500/50 mt-4">
                      {new Date(arc.createdAt).toLocaleDateString(
                        "en-US",
                        {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        },
                      )}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          // Empty state — prompt to forge their first arc
          <div
            className="rounded-xl p-12 border text-center mb-12"
            style={{
              background: "rgba(255, 255, 255, 0.02)",
              borderColor: "rgba(255, 255, 255, 0.06)",
              borderStyle: "dashed",
            }}>
            <p className="text-[#AFA9EC] mb-6">
              Your arc hasn&apos;t begun yet.
            </p>
            <Link
              href="/awakening"
              className="inline-block bg-linear-to-r from-[#534AB7] to-[#6B5FD8] text-[#EEEDFE] px-8 py-3 rounded-xl text-sm font-medium no-underline hover:opacity-90 transition-opacity">
              Forge Episode 1
            </Link>
          </div>
        )}

        {/* Claim arc section — for users who generated an arc
            before signing up and want to attach it to their account */}
        <ClaimArcForm userId={user.id} />

        {/* Sign out */}
        <div className="text-center mt-8">
          <form action="/api/auth/sign-out" method="POST">
            <button
              type="submit"
              className="text-sm text-purple-400/60 hover:text-purple-300 transition-colors">
              Sign out
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

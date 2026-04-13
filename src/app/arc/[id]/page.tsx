// src/app/arc/[id]/page.tsx
// This is a server component that acts as a router between two experiences.
// Owner view now depends on a signed server cookie rather than a
// query parameter so private content is not exposed by URL tampering.
// This distinction is made server-side before any JavaScript runs —
// faster, better for SEO, and the correct architecture for Next.js.

import { notFound } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";
import { cookies, headers } from "next/headers";
import prisma from "@/lib/prisma";
import { GeneratedArc } from "@/types/arc";
import ArcCard from "@/components/arc/ArcCard";
import ArcReveal from "@/components/arc/ArcReveal";
import {
  hasOwnerAccess,
  OWNER_SESSION_COOKIE,
} from "@/lib/ownerSession";
import { auth } from "@/lib/auth";

interface ArcPageProps {
  params: Promise<{ id: string }>;
}

async function getArc(id: string) {
  return prisma.arc.findUnique({ where: { id } });
}

export async function generateMetadata({
  params,
}: ArcPageProps): Promise<Metadata> {
  const { id } = await params;
  const arc = await getArc(id);

  if (!arc) return { title: "Arc not found — ArcForge" };

  const arcData = arc.arcData as unknown as GeneratedArc;
  const ogImageUrl = `https://arcforge.me/api/og/${id}`;

  return {
    title: `${arcData.character_name} — ArcForge`,
    description: arcData.opening_episode_quote,
    openGraph: {
      title: arcData.character_name,
      description: arcData.opening_episode_quote,
      images: [{ url: ogImageUrl, width: 1200, height: 630 }],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: arcData.character_name,
      description: arcData.opening_episode_quote,
      images: [ogImageUrl],
    },
  };
}

export default async function ArcPage({ params }: ArcPageProps) {
  const { id } = await params;

  const arc = await getArc(id);
  if (!arc) notFound();

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const arcData = arc.arcData as unknown as GeneratedArc;
  // The share URL is the canonical public URL — no query params.
  // This is what goes into the clipboard when the user copies their link.
  const shareUrl = `https://arcforge.me/arc/${id}`;

  // ── Owner reveal experience ──────────────────────────────────────
  if (session && arc.userId === session.user.id) {
    return (
      // ArcReveal is a client component that handles animations
      // and browser APIs like clipboard. We pass all arc data as
      // props so it has everything it needs without making its own
      // database call — the server component already fetched it.
      <ArcReveal arc={arcData} arcId={id} shareUrl={shareUrl} />
    );
  }

  const cookieStore = await cookies();
  const ownerSessionCookie = cookieStore.get(
    OWNER_SESSION_COOKIE,
  )?.value;

  if (hasOwnerAccess(ownerSessionCookie, id)) {
    return (
      // ArcReveal is a client component that handles animations
      // and browser APIs like clipboard. We pass all arc data as
      // props so it has everything it needs without making its own
      // database call — the server component already fetched it.
      <ArcReveal arc={arcData} arcId={id} shareUrl={shareUrl} />
    );
  }

  // ── Public share view ────────────────────────────────────────────
  // Someone arrived via a shared link. They haven't generated an arc
  // so they have no emotional investment in the deep analysis.
  // We show enough to demonstrate the product's quality and create
  // desire — the card, the quote, the archetype — but withhold the
  // personal depth (wound, weapon, mission) which belongs to the owner.
  return (
    <main className="-mt-18 min-h-screen bg-forge-bg-deepest text-[#EEEDFE] py-12 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Branding header */}
        <div className="flex items-center justify-center gap-2 mb-12">
          <span
            className="text-base font-bold uppercase tracking-widest text-[#AFA9EC]"
            style={{ fontFamily: "var(--font-heading)" }}>
            ArcForge
          </span>
        </div>

        {/* Arc identity — the emotional hook for a first-time visitor */}
        <div className="text-center mb-8">
          <p className="text-xs font-medium tracking-[0.15em] uppercase text-purple-400 mb-4">
            Episode 01 · The Awakening
          </p>
          <h1
            className="font-heading font-bold text-[#EEEDFE] mb-6"
            style={{ fontSize: "clamp(2.5rem, 6vw, 4rem)" }}>
            {arcData.character_name}
          </h1>
          <p className="text-lg text-purple-200/80 italic max-w-2xl mx-auto leading-relaxed mb-8">
            &quot;{arcData.opening_episode_quote}&quot;
          </p>
        </div>

        {/* The Arc Card — the primary visual that was shared */}
        <div className="flex justify-center mb-12">
          <ArcCard arc={arcData} arcId={id} />
        </div>

        {/* Genre vibe — a safe, shareable conversation starter
            that doesn't expose personal wound/weapon content */}
        {arcData.if_they_were_a_genre && (
          <div className="text-center mb-12">
            <p className="text-xs uppercase tracking-widest text-purple-500 mb-2">
              If this arc were an anime
            </p>
            <p className="text-sm italic text-purple-200/70">
              {arcData.if_they_were_a_genre}
            </p>
          </div>
        )}

        {/* CTA — this is the entire point of the public view.
            Convert a curious visitor into someone who generates their own arc. */}
        <div className="text-center space-y-4">
          <p className="text-[#AFA9EC] text-base">
            This arc was forged for someone else.
          </p>
          <p
            className="text-[#EEEDFE] text-lg font-medium"
            style={{ fontFamily: "var(--font-heading)" }}>
            What does yours look like?
          </p>
          <Link
            href="/awakening"
            className="inline-block bg-linear-to-r from-[#534AB7] to-[#6B5FD8] hover:from-[#6B5FD8] hover:to-[#7F73E8] text-[#EEEDFE] px-10 py-4 rounded-xl text-base font-medium transition-all duration-300 no-underline">
            Forge my arc
          </Link>
        </div>

        {/* Viral nudge — the one social mechanic on the public page */}
        <div className="text-center mt-16">
          <p className="text-xs text-purple-400/50 tracking-widest">
            Tag 3 friends to reveal their arc.
          </p>
        </div>
      </div>
    </main>
  );
}

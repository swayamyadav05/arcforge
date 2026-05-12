// src/app/arc/[id]/page.tsx

import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import prisma from "@/lib/prisma";
import type { GeneratedArc } from "@/types/arc";
import type { EpisodeNOutput } from "@/types/episode-n";
import ArcCard from "@/components/arc/ArcCard";
import EpisodeLabel from "@/components/ui/EpisodeLabel";

interface ArcPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ ep?: string }>;
}

export async function generateMetadata({
  params,
}: ArcPageProps): Promise<Metadata> {
  const { id } = await params;

  const arc = await prisma.arc.findUnique({
    where: { id },
    select: {
      episodeNumber: true,
      arcData: true,
      series: { select: { storyBible: { select: { bible: true } } } },
    },
  });

  if (!arc) return { title: "Arc not found — ArcForge" };

  const ogImageUrl = `https://arcforge.me/api/og/${id}`;
  const isEp1 = (arc.episodeNumber ?? 1) === 1;

  if (isEp1) {
    const arcData = arc.arcData as unknown as GeneratedArc;
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

  const epData = arc.arcData as unknown as EpisodeNOutput;
  const bible = arc.series?.storyBible?.bible as
    | Record<string, unknown>
    | null
    | undefined;
  const protagonist = (
    bible?.characters as Record<string, unknown> | undefined
  )?.protagonist as Record<string, unknown> | undefined;
  const characterName = (protagonist?.name as string | undefined) ?? "Protagonist";

  return {
    title: `${characterName} — Episode ${arc.episodeNumber} — ArcForge`,
    description: epData.opening_quote,
    openGraph: {
      title: `${characterName} — Episode ${arc.episodeNumber}`,
      description: epData.opening_quote,
      images: [{ url: ogImageUrl, width: 1200, height: 630 }],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${characterName} — Episode ${arc.episodeNumber}`,
      description: epData.opening_quote,
      images: [ogImageUrl],
    },
  };
}

export default async function ArcPage({ params, searchParams }: ArcPageProps) {
  const { id } = await params;
  const { ep: epParam } = await searchParams;
  const targetEpNum = epParam ? Math.max(1, parseInt(epParam, 10)) : 1;

  const arc = await prisma.arc.findUnique({
    where: { id },
    select: { id: true, seriesId: true, episodeNumber: true, arcData: true },
  });
  if (!arc) notFound();

  // ── Load identity (ep1) + target episode ──────────────────────────────────
  let ep1Data: GeneratedArc;
  let epNData: EpisodeNOutput | null = null;
  let episodeCount: number | null = null;

  if (!arc.seriesId) {
    // Legacy single-episode arc
    ep1Data = arc.arcData as unknown as GeneratedArc;
  } else {
    const [ep1, targetEp, series] = await Promise.all([
      prisma.arc.findFirst({
        where: { seriesId: arc.seriesId, episodeNumber: 1 },
        select: { arcData: true },
      }),
      targetEpNum > 1
        ? prisma.arc.findFirst({
            where: { seriesId: arc.seriesId, episodeNumber: targetEpNum },
            select: { arcData: true },
          })
        : null,
      prisma.arcSeries.findUnique({
        where: { id: arc.seriesId },
        select: { currentEpisode: true },
      }),
    ]);

    ep1Data = (ep1?.arcData ?? arc.arcData) as unknown as GeneratedArc;
    epNData =
      targetEpNum > 1 && targetEp
        ? (targetEp.arcData as unknown as EpisodeNOutput)
        : null;
    episodeCount = series?.currentEpisode ?? null;
  }

  // ── Per-episode fields ────────────────────────────────────────────────────
  const openingQuote = epNData
    ? epNData.opening_quote
    : ep1Data.opening_episode_quote;
  const bodyText = epNData
    ? epNData.episode_scene
    : ep1Data.episode_one_scenario;
  const subtitle = epNData ? epNData.episode_title : ep1Data.archetype;

  return (
    <main className="-mt-18 min-h-screen bg-forge-bg-deepest text-[#EEEDFE] py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-center gap-2 mb-12">
          <span
            className="text-base font-bold uppercase tracking-widest text-[#AFA9EC]"
            style={{ fontFamily: "var(--font-heading)" }}>
            ArcForge
          </span>
        </div>

        <div className="text-center mb-8">
          <EpisodeLabel episodeNumber={targetEpNum} className="mb-4" />
          {episodeCount !== null && episodeCount > 1 && (
            <p className="text-xs uppercase tracking-widest text-purple-500 mb-3">
              {episodeCount} episodes · ongoing arc
            </p>
          )}
          <h1
            className="font-heading font-bold text-[#EEEDFE] mb-6"
            style={{ fontSize: "clamp(2.5rem, 6vw, 4rem)" }}>
            {ep1Data.character_name}
          </h1>
          <p className="text-lg text-purple-200/80 italic max-w-2xl mx-auto leading-relaxed mb-8">
            &quot;{openingQuote}&quot;
          </p>
        </div>

        <div className="flex justify-center mb-12">
          <ArcCard
            arc={ep1Data}
            arcId={id}
            episodeNumber={targetEpNum}
            bodyText={bodyText}
            subtitle={subtitle}
          />
        </div>

        {ep1Data.if_they_were_a_genre && (
          <div className="text-center mb-12">
            <p className="text-xs uppercase tracking-widest text-purple-500 mb-2">
              If this arc were an anime
            </p>
            <p className="text-sm italic text-purple-200/70">
              {ep1Data.if_they_were_a_genre}
            </p>
          </div>
        )}

        {targetEpNum > 1 && (
          <div className="text-center mb-8">
            <p className="text-xs text-purple-400/50 tracking-widest">
              This is one episode of an ongoing arc.
            </p>
          </div>
        )}

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

        <div className="text-center mt-16">
          <p className="text-xs text-purple-400/50 tracking-widest">
            Tag 3 friends to reveal their arc.
          </p>
        </div>
      </div>
    </main>
  );
}

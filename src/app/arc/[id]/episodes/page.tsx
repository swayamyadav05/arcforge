// src/app/arc/[id]/episodes/page.tsx

import { notFound, redirect } from "next/navigation";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import type { GeneratedArc } from "@/types/arc";
import type { StoryBibleShape } from "@/types/story-bible";
import ArcReveal from "@/components/arc/ArcReveal";
import { auth } from "@/lib/auth";

interface EpisodesPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ ep?: string }>;
}

function parseBible(raw: unknown): StoryBibleShape | null {
  if (raw === null || raw === undefined) return null;
  let obj: unknown = raw;
  if (typeof raw === "string") {
    try {
      obj = JSON.parse(raw);
    } catch {
      return null;
    }
  }
  const b = obj as Record<string, unknown>;
  if (!b.characters || !(b.characters as Record<string, unknown>).protagonist)
    return null;
  return b as unknown as StoryBibleShape;
}

export default async function EpisodesPage({
  params,
  searchParams,
}: EpisodesPageProps) {
  const { id } = await params;
  const { ep: epParam } = await searchParams;
  const epParamNum = epParam ? parseInt(epParam, 10) : null;

  const arc = await prisma.arc.findUnique({
    where: { id },
    select: {
      id: true,
      seriesId: true,
      episodeNumber: true,
      userId: true,
      arcData: true,
    },
  });
  if (!arc) notFound();

  const headersStore = await headers();
  const session = await auth.api.getSession({ headers: headersStore });

  if (!session || arc.userId !== session.user.id) {
    redirect(`/arc/${id}`);
  }

  // ── Legacy single-episode arc (no series) ─────────────────────────────────
  if (!arc.seriesId) {
    const arcData = arc.arcData as unknown as GeneratedArc;
    return (
      <ArcReveal
        episodes={[
          {
            id: arc.id,
            episodeNumber: arc.episodeNumber ?? 1,
            arcData: arc.arcData as Record<string, unknown>,
          },
        ]}
        initialEpisodeIndex={0}
        characterName={arcData.character_name}
        isOwner={true}
      />
    );
  }

  // ── Series carousel ───────────────────────────────────────────────────────
  const series = await prisma.arcSeries.findUnique({
    where: { id: arc.seriesId },
    select: {
      userId: true,
      episodes: {
        orderBy: { episodeNumber: "asc" },
        select: { id: true, episodeNumber: true, arcData: true },
      },
      storyBible: { select: { bible: true } },
    },
  });
  if (!series) notFound();

  if (series.userId !== session.user.id) {
    redirect(`/arc/${id}`);
  }

  const bible = parseBible(series.storyBible?.bible);
  const ep1Data = series.episodes.find((e) => e.episodeNumber === 1)
    ?.arcData as unknown as GeneratedArc | undefined;
  const characterName =
    bible?.characters.protagonist.name ??
    ep1Data?.character_name ??
    "Protagonist";

  const episodes = series.episodes.map((e) => ({
    id: e.id,
    episodeNumber: e.episodeNumber ?? 1,
    arcData: e.arcData as Record<string, unknown>,
  }));

  // ?ep=N opens the carousel at a specific episode; fallback to the arc's own episode
  const found = epParamNum
    ? episodes.findIndex((e) => e.episodeNumber === epParamNum)
    : episodes.findIndex((e) => e.id === id);
  const initialIndex = found >= 0 ? found : episodes.length - 1;

  return (
    <ArcReveal
      episodes={episodes}
      initialEpisodeIndex={initialIndex}
      characterName={characterName}
      isOwner={true}
    />
  );
}

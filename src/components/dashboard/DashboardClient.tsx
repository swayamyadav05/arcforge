"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Filter, Plus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import EpisodeLabel from "@/components/ui/EpisodeLabel";
import RarityBadge from "@/components/ui/RarityBadge";
import SignOutButton from "@/components/dashboard/SignOutButton";
import ReflectionCard from "@/components/dashboard/ReflectionCard";
import ReflectionDialog from "@/components/reflection/ReflectionDialog";
import type { ArcRarity, GeneratedArc } from "@/types/arc";
import type { EpisodeNOutput } from "@/types/episode-n";

// ── Types ────────────────────────────────────────────────────────────────────

export interface DashboardEpisode {
  id: string;
  episodeNumber: number;
  arcData: Record<string, unknown>;
}

export interface DashboardSeries {
  id: string;
  status: "active" | "archived";
  currentEpisode: number;
  daysSincePrev: number;
  hasDraft: boolean;
  missionPreview: string;
  episodes: DashboardEpisode[];
}

export interface DashboardUser {
  id: string;
  name: string | null;
  email: string | null;
}

interface DashboardClientProps {
  user: DashboardUser;
  series: DashboardSeries[];
  heroName: string;
}

type RarityFilter = "All" | ArcRarity;

const RARITIES: RarityFilter[] = [
  "All",
  "Legendary",
  "Mythic",
  "Rare",
  "Common",
];

const STAT_KEYS = ["Resolve", "Chaos", "Empathy", "Focus"] as const;

// ── Component ────────────────────────────────────────────────────────────────

export default function DashboardClient({
  user,
  series,
  heroName,
}: DashboardClientProps) {
  const router = useRouter();
  const [selectedRarity, setSelectedRarity] = useState<RarityFilter>("All");
  const [openSeriesId, setOpenSeriesId] = useState<string | null>(null);

  const accountName = user.name ?? user.email ?? "Protagonist";
  const hasSeries = series.length > 0;

  const filteredSeries = useMemo(() => {
    if (selectedRarity === "All") return series;
    return series.filter(
      (s) =>
        (s.episodes[0]?.arcData as unknown as GeneratedArc | undefined)
          ?.rarity === selectedRarity,
    );
  }, [series, selectedRarity]);

  const openSeries = openSeriesId
    ? (series.find((s) => s.id === openSeriesId) ?? null)
    : null;

  return (
    <div className="relative min-h-screen bg-forge-bg-deepest text-forge-white">
      <div className="absolute inset-0 bg-linear-to-br from-forge-purple-900/20 via-forge-bg-deepest to-forge-purple-700/20 opacity-50" />

      <div className="relative z-10">
        {/* ── Nav ──────────────────────────────────────────────────── */}
        <div className="sticky top-0 z-20 border-b border-white/5 bg-forge-bg-deepest/80 backdrop-blur-md">
          <div className="mx-auto flex w-full max-w-screen-2xl items-center justify-between px-6 py-5">
            <Link href="/" className="no-underline">
              <span className="font-heading font-extrabold tracking-tighter uppercase text-[22px] text-[#EEEDFE]">
                ArcForge
              </span>
            </Link>
            <div
              className="flex items-center space-x-4"
              aria-label={`${accountName} dashboard actions`}>
              <SignOutButton className="text-sm font-medium text-[#D8B4FE] no-underline hover:text-[#EEEDFE] transition-colors duration-200" />
              <Button size="sm" asChild>
                <Link href="/awakening">
                  <Plus className="mr-2 h-4 w-4" />
                  New Arc
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* ── Empty state ───────────────────────────────────────────── */}
        {!hasSeries ? (
          <div className="flex min-h-[60vh] items-center justify-center">
            <div className="mx-auto max-w-2xl px-6 text-center">
              <div className="relative mb-12">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-32 w-32 rounded-full bg-purple-500/10 blur-3xl" />
                </div>
                <div className="relative">
                  <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full border-2 border-dashed border-purple-500/30">
                    <Sparkles className="h-10 w-10 text-purple-400/40" />
                  </div>
                </div>
              </div>

              <h2
                className="mb-6 bg-linear-to-b from-white to-purple-200 bg-clip-text text-5xl font-bold text-transparent"
                style={{ fontFamily: "var(--font-heading)" }}>
                Your story
                <br />
                hasn&apos;t started yet.
              </h2>

              <p className="mb-8 text-xl leading-relaxed text-[#AFA9EC]">
                Every protagonist begins somewhere.
                <br />
                This is where yours begins.
              </p>

              <div className="mb-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Button size="lg" asChild>
                  <Link href="/awakening">Forge your first arc →</Link>
                </Button>
                <button
                  type="button"
                  onClick={() =>
                    toast("Public gallery coming soon — stay tuned.")
                  }
                  className="text-sm text-purple-400/70 no-underline transition-colors duration-300 hover:text-purple-300">
                  Explore others&apos; arcs →
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* ── Main content ─────────────────────────────────────────── */
          <div className="container mx-auto px-6 py-10">
            <div className="mb-12 text-center">
              <div className="mb-3 text-xs tracking-widest text-purple-400/60 uppercase">
                YOUR ARC
              </div>
              <h1
                className="mb-4 text-5xl font-bold lg:text-6xl"
                style={{ fontFamily: "var(--font-heading)" }}>
                {heroName}
              </h1>
              <p className="mx-auto max-w-2xl text-xl text-purple-200/80">
                Your arc, episode by episode.
              </p>
            </div>

            {/* Rarity filter */}
            <div className="mb-12 flex flex-wrap items-center justify-center gap-3">
              <div className="flex items-center space-x-2 text-purple-300">
                <Filter className="h-4 w-4" />
                <span className="text-sm font-medium">Filter by rarity:</span>
              </div>
              {RARITIES.map((rarity) => (
                <button
                  key={rarity}
                  type="button"
                  onClick={() => setSelectedRarity(rarity)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 ${
                    selectedRarity === rarity
                      ? "bg-linear-to-r from-forge-purple-700 to-forge-lavender-600 text-forge-white shadow-lg shadow-purple-500/30"
                      : "border border-purple-500/20 bg-purple-950/30 text-purple-300 hover:bg-purple-950/50"
                  }`}>
                  {rarity}
                </button>
              ))}
            </div>

            {filteredSeries.length === 0 ? (
              <div className="py-14 text-center">
                <p className="mb-6 text-lg text-purple-300/60">
                  No arcs found with this rarity.
                </p>
                <Button
                  type="button"
                  onClick={() => setSelectedRarity("All")}
                  className="bg-linear-to-r from-forge-purple-700 to-forge-lavender-600 text-forge-white hover:from-forge-lavender-600 hover:to-forge-lavender-400">
                  View all arcs
                </Button>
              </div>
            ) : (
              <div className="mx-auto grid max-w-7xl gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredSeries.map((s) => {
                  const ep1Data = s.episodes[0]
                    ?.arcData as unknown as GeneratedArc;

                  return (
                    <React.Fragment key={s.id}>
                      {s.episodes.map((ep) => {
                        const isFirstEp = ep.episodeNumber === 1;
                        const epN = ep.arcData as unknown as EpisodeNOutput;
                        // Per-episode flavor fields
                        const subtitle = isFirstEp
                          ? ep1Data.archetype
                          : epN.episode_title;
                        const bodyText = isFirstEp
                          ? ep1Data.episode_one_scenario
                          : epN.episode_scene;

                        return (
                          <Link
                            key={ep.id}
                            href={
                              ep.episodeNumber === 1
                                ? `/arc/${s.episodes[0].id}/episodes`
                                : `/arc/${s.episodes[0].id}/episodes?ep=${ep.episodeNumber}`
                            }
                            className="group block cursor-pointer no-underline">
                            <div className="rounded-xl border border-purple-500/20 bg-linear-to-br from-purple-950/40 to-purple-900/20 p-6 transition-all duration-300 hover:scale-105 hover:border-purple-400/40 hover:shadow-xl hover:shadow-purple-500/20">
                              <div className="mb-4 flex items-start justify-between">
                                <EpisodeLabel episodeNumber={ep.episodeNumber} />
                                <RarityBadge
                                  rarity={ep1Data.rarity}
                                  variant="gradient"
                                />
                              </div>

                              <h3
                                className="mb-2 text-2xl font-bold transition-colors group-hover:text-purple-300"
                                style={{ fontFamily: "var(--font-heading)" }}>
                                {ep1Data.character_name}
                              </h3>

                              <div className="mb-4 text-sm text-purple-400">
                                {subtitle}
                              </div>

                              <p className="mb-6 line-clamp-3 text-sm leading-relaxed text-purple-200/70">
                                {bodyText}
                              </p>

                              {ep1Data.numeric_stats ? (
                                <div className="mb-4 grid grid-cols-4 gap-2 text-xs">
                                  {STAT_KEYS.map((label) => (
                                    <div key={label} className="text-center">
                                      <div className="text-purple-400">
                                        {label}
                                      </div>
                                      <div className="font-bold text-white">
                                        {ep1Data.numeric_stats![
                                          label.toLowerCase() as keyof NonNullable<
                                            typeof ep1Data.numeric_stats
                                          >
                                        ]}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : null}

                              <div className="mb-4 border-t border-purple-500/20 pt-4 text-xs text-purple-300/80">
                                <span className="font-medium text-purple-300">
                                  Signature Move:
                                </span>
                                <div className="mt-1 line-clamp-2">
                                  {ep1Data.signature_move}
                                </div>
                              </div>

                              <div className="flex items-center justify-between border-t border-purple-500/20 pt-4">
                                <div className="text-xs text-purple-400/60">
                                  Episode{" "}
                                  {String(ep.episodeNumber).padStart(2, "0")}
                                </div>
                                <div className="text-sm font-medium text-purple-300 transition-colors group-hover:text-purple-200">
                                  View episode →
                                </div>
                              </div>
                            </div>
                          </Link>
                        );
                      })}

                      {/* Reflection card — active series only */}
                      {s.status === "active" && (
                        <ReflectionCard
                          seriesId={s.id}
                          characterName={ep1Data.character_name}
                          episodeNumber={s.currentEpisode + 1}
                          daysSincePrev={s.daysSincePrev}
                          hasDraft={s.hasDraft}
                          missionPreview={s.missionPreview}
                          onClick={() => setOpenSeriesId(s.id)}
                        />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* FAB */}
      {hasSeries ? (
        <Link
          href="/awakening"
          aria-label="Start a new arc"
          className="fixed right-8 bottom-8 z-30 rounded-full bg-primary p-4 text-primary-foreground shadow-2xl shadow-purple-500/50 transition-all duration-300 hover:scale-110 hover:bg-primary/80 hover:shadow-purple-500/70"
          title="Start a new arc">
          <Plus className="h-6 w-6" />
        </Link>
      ) : null}

      {/* Reflection dialog */}
      {openSeries && (
        <ReflectionDialog
          seriesId={openSeries.id}
          characterName={
            (
              openSeries.episodes[0]
                ?.arcData as unknown as GeneratedArc | undefined
            )?.character_name ?? "Protagonist"
          }
          episodeNumber={openSeries.currentEpisode + 1}
          open={true}
          onOpenChange={(o) => {
            if (!o) setOpenSeriesId(null);
          }}
          onGenerated={() => {
            const ep1ArcId = openSeries.episodes[0]?.id;
            const newEpNum = openSeries.currentEpisode + 1;
            setOpenSeriesId(null);
            router.push(
              ep1ArcId
                ? `/arc/${ep1ArcId}/episodes?ep=${newEpNum}`
                : `/dashboard`,
            );
          }}
        />
      )}
    </div>
  );
}

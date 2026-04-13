"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Filter, Plus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import SignOutButton from "@/components/dashboard/SignOutButton";
import type { ArcRarity, GeneratedArc } from "@/types/arc";

export interface DashboardUser {
  id: string;
  name: string | null;
  email: string | null;
}

export interface DashboardArc {
  id: string;
  createdAt: string;
  arcData: GeneratedArc;
}

interface DashboardClientProps {
  user: DashboardUser;
  arcs: DashboardArc[];
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

function getEpisodeTitle(index: number) {
  if (index === 0) return "THE AWAKENING";
  if (index === 1) return "THE CONFRONTATION";
  return "THE CONTINUATION";
}

function getRarityColor(rarity: ArcRarity) {
  if (rarity === "Legendary")
    return "from-amber-500/20 to-yellow-300/20";
  if (rarity === "Mythic") return "from-purple-500/20 to-pink-400/20";
  if (rarity === "Rare") return "from-blue-500/20 to-cyan-400/20";
  return "from-gray-400/20 to-gray-300/20";
}

export default function DashboardClient({
  user,
  arcs,
  heroName,
}: DashboardClientProps) {
  const [selectedRarity, setSelectedRarity] =
    useState<RarityFilter>("All");

  const accountName = user.name ?? user.email ?? "Protagonist";

  const arcsWithMeta = useMemo(
    () =>
      arcs.map((arc, index) => ({
        ...arc,
        episodeNumber: index + 1,
        episodeTitle: getEpisodeTitle(index),
        episodeCount: index + 1,
      })),
    [arcs],
  );

  const filteredArcs = useMemo(() => {
    if (selectedRarity === "All") {
      return arcsWithMeta;
    }
    return arcsWithMeta.filter(
      (arc) => arc.arcData.rarity === selectedRarity,
    );
  }, [arcsWithMeta, selectedRarity]);

  const hasArcs = arcsWithMeta.length > 0;

  return (
    <div className="relative min-h-screen bg-forge-bg-deepest text-forge-white">
      <div className="absolute inset-0 bg-linear-to-br from-forge-purple-900/20 via-forge-bg-deepest to-forge-purple-700/20 opacity-50" />

      <div className="relative z-10">
        <div className="sticky top-0 z-20 border-b border-white/5 bg-forge-bg-deepest/80 backdrop-blur-md">
          <div className="flex justify-between items-center px-6 py-5 w-full max-w-screen-2xl mx-auto">
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

        {!hasArcs ? (
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
                <Button
                  asChild
                  className="h-auto! rounded-lg bg-linear-to-r from-forge-purple-700 to-forge-lavender-600 px-8 py-6! text-lg text-forge-white shadow-lg shadow-purple-500/30 transition-all duration-300 hover:from-forge-lavender-600 hover:to-forge-lavender-400 hover:shadow-purple-500/50">
                  <Link href="/awakening">
                    <Plus className="mr-2 h-5 w-5" />
                    Forge your first arc
                  </Link>
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
                These are your arcs. Your stories. Your evolution.
              </p>
            </div>

            <div className="mb-12 flex flex-wrap items-center justify-center gap-3">
              <div className="flex items-center space-x-2 text-purple-300">
                <Filter className="h-4 w-4" />
                <span className="text-sm font-medium">
                  Filter by rarity:
                </span>
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

            {filteredArcs.length === 0 ? (
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
                {filteredArcs.map((arc) => (
                  <Link
                    key={arc.id}
                    href={`/arc/${arc.id}?new=true`}
                    className="group block cursor-pointer no-underline">
                    <div className="rounded-xl border border-purple-500/20 bg-linear-to-br from-purple-950/40 to-purple-900/20 p-6 transition-all duration-300 hover:scale-105 hover:border-purple-400/40 hover:shadow-xl hover:shadow-purple-500/20">
                      <div className="mb-4 flex items-start justify-between">
                        <div className="text-xs tracking-widest text-purple-300/60 uppercase">
                          EPISODE{" "}
                          {String(arc.episodeNumber).padStart(2, "0")}{" "}
                          · {arc.episodeTitle}
                        </div>
                        <div
                          className={`rounded-full bg-linear-to-r ${getRarityColor(arc.arcData.rarity)} px-3 py-1 text-xs font-medium text-white shadow-lg`}>
                          {arc.arcData.rarity}
                        </div>
                      </div>

                      <h3
                        className="mb-2 text-2xl font-bold transition-colors group-hover:text-purple-300"
                        style={{ fontFamily: "var(--font-heading)" }}>
                        {arc.arcData.character_name}
                      </h3>

                      <div className="mb-4 text-sm text-purple-400">
                        {arc.arcData.archetype}
                      </div>

                      <p className="mb-6 line-clamp-3 text-sm italic leading-relaxed text-purple-200/70">
                        &quot;{arc.arcData.opening_episode_quote}
                        &quot;
                      </p>

                      {arc.arcData.numeric_stats ? (
                        <div className="mb-4 grid grid-cols-4 gap-2 text-xs">
                          <div className="text-center">
                            <div className="text-purple-400">
                              Resolve
                            </div>
                            <div className="font-bold text-white">
                              {arc.arcData.numeric_stats.resolve}
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-purple-400">
                              Chaos
                            </div>
                            <div className="font-bold text-white">
                              {arc.arcData.numeric_stats.chaos}
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-purple-400">
                              Empathy
                            </div>
                            <div className="font-bold text-white">
                              {arc.arcData.numeric_stats.empathy}
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-purple-400">
                              Focus
                            </div>
                            <div className="font-bold text-white">
                              {arc.arcData.numeric_stats.focus}
                            </div>
                          </div>
                        </div>
                      ) : null}

                      <div className="mb-4 border-t border-purple-500/20 pt-4 text-xs text-purple-300/80">
                        <span className="font-medium text-purple-300">
                          Signature Move:
                        </span>
                        <div className="mt-1 line-clamp-2">
                          {arc.arcData.signature_move}
                        </div>
                      </div>

                      <div className="flex items-center justify-between border-t border-purple-500/20 pt-4">
                        <div className="text-xs text-purple-400/60">
                          {arc.episodeCount}{" "}
                          {arc.episodeCount === 1
                            ? "episode"
                            : "episodes"}
                        </div>
                        <div className="text-sm font-medium text-purple-300 transition-colors group-hover:text-purple-200">
                          View full arc →
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {hasArcs ? (
        <Link
          href="/awakening"
          className="fixed right-8 bottom-8 z-30 rounded-full bg-primary p-4 text-primary-foreground shadow-2xl shadow-purple-500/50 transition-all duration-300 hover:scale-110 hover:bg-primary/80 hover:shadow-purple-500/70"
          title="Start a new arc">
          <Plus className="h-6 w-6" />
        </Link>
      ) : null}
    </div>
  );
}

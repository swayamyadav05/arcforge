// src/components/arc/ArcReveal.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { Share2, Copy, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import ArcCard from "./ArcCard";
import EpisodeLabel from "@/components/ui/EpisodeLabel";
import type { GeneratedArc } from "@/types/arc";
import type { EpisodeNOutput } from "@/types/episode-n";
import { usePostHog } from "posthog-js/react";

interface EpisodeData {
  id: string;
  episodeNumber: number;
  arcData: Record<string, unknown>;
}

interface ArcRevealProps {
  episodes: EpisodeData[];
  initialEpisodeIndex: number;
  characterName: string;
  isOwner: boolean;
}

const EP_WORDS: Record<number, string> = {
  1: "One", 2: "Two", 3: "Three", 4: "Four", 5: "Five",
  6: "Six", 7: "Seven", 8: "Eight", 9: "Nine", 10: "Ten",
};

function episodeWord(n: number): string {
  return EP_WORDS[n] ?? String(n).padStart(2, "0");
}

export default function ArcReveal({
  episodes,
  initialEpisodeIndex,
  characterName,
  isOwner,
}: ArcRevealProps) {
  const [currentIndex, setCurrentIndex] = useState(initialEpisodeIndex);
  const [isVisible, setIsVisible] = useState(false);
  const [copied, setCopied] = useState(false);

  const posthog = usePostHog();
  const showCarousel = isOwner && episodes.length > 1;

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const goTo = useCallback(
    (index: number) => {
      if (index < 0 || index >= episodes.length) return;
      setIsVisible(false);
      setTimeout(() => {
        setCurrentIndex(index);
        setIsVisible(true);
      }, 200);
    },
    [episodes.length],
  );

  useEffect(() => {
    if (!showCarousel) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "ArrowLeft") goTo(currentIndex - 1);
      if (e.key === "ArrowRight") goTo(currentIndex + 1);
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [showCarousel, currentIndex, goTo]);

  const ep = episodes[currentIndex];
  // Identity always sourced from Episode 1 (index 0)
  const ep1 = episodes[0];
  const isEp1 = ep.episodeNumber === 1;
  const arc = ep1.arcData as unknown as GeneratedArc;
  const epData = ep.arcData as unknown as EpisodeNOutput;

  const openingQuote = isEp1 ? arc.opening_episode_quote : epData.opening_quote;
  const mission = isEp1 ? arc.episode_one_mission : epData.next_mission;
  const bodyText = isEp1 ? arc.episode_one_scenario : epData.episode_scene;
  const subtitle = isEp1 ? arc.archetype : epData.episode_title;

  // Share URL: ep1 gets a clean URL; ep2+ gets ?ep=N on ep1's canonical URL.
  // The ?ep param tells page.tsx which episode to show initially.
  const shareUrl =
    typeof window !== "undefined"
      ? ep.episodeNumber === 1
        ? `${window.location.origin}/arc/${ep1.id}`
        : `${window.location.origin}/arc/${ep1.id}?ep=${ep.episodeNumber}`
      : `https://arcforge.me/arc/${ep1.id}`;

  async function handleShare() {
    posthog.capture("share_clicked", { arcId: ep.id, method: "native_share" });
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({
          title: `${characterName} — Episode ${ep.episodeNumber}`,
          text: openingQuote,
          url: shareUrl,
        });
      } catch (err) {
        if (err instanceof Error && err.name !== "AbortError") {
          await handleCopyLink();
        }
      }
    } else {
      await handleCopyLink();
    }
  }

  async function handleCopyLink() {
    posthog.capture("share_clicked", { arcId: ep.id, method: "copy_link" });
    try {
      await navigator.clipboard.writeText(shareUrl);
    } catch {
      // Fallback for restricted clipboard environments
      const textarea = document.createElement("textarea");
      textarea.value = shareUrl;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="relative min-h-screen bg-forge-bg-deepest text-white pt-4 px-6 pb-8">
      {showCarousel && (
        <div className="text-center mb-2">
          <span className="text-xs text-purple-500 tracking-widest">
            {currentIndex + 1} / {episodes.length}
          </span>
        </div>
      )}

      <div
        className={`max-w-5xl mx-auto transition-opacity duration-200 ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}>

        {/* ── Header ──────────────────────────────────────────────────── */}
        <div className="text-center mb-12">
          <EpisodeLabel episodeNumber={ep.episodeNumber} className="mb-4" />
          <h1 className="text-5xl lg:text-6xl font-bold mb-4 font-heading">
            {characterName}
          </h1>
          <div className="inline-block px-4 py-2 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-200 text-sm mb-6">
            {isEp1 ? arc.archetype : epData.episode_title}
          </div>
          <p className="text-xl text-purple-200/80 italic max-w-3xl mx-auto leading-relaxed">
            &quot;{openingQuote}&quot;
          </p>
        </div>

        {/* ── Arc Card flanked by carousel arrows ─────────────────────── */}
        <div className="flex items-center justify-center gap-4 mb-12">
          <div className="w-12 flex justify-center">
            {showCarousel && currentIndex > 0 && (
              <button
                onClick={() => goTo(currentIndex - 1)}
                className="bg-purple-950/80 border border-purple-500/20 rounded-full p-3 text-purple-300 hover:text-white hover:bg-purple-800/80 transition-all duration-200"
                aria-label="Previous episode">
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
          </div>
          <ArcCard
            arc={arc}
            arcId={ep1.id}
            episodeNumber={ep.episodeNumber}
            bodyText={bodyText}
            subtitle={subtitle}
          />
          <div className="w-12 flex justify-center">
            {showCarousel && currentIndex < episodes.length - 1 && (
              <button
                onClick={() => goTo(currentIndex + 1)}
                className="bg-purple-950/80 border border-purple-500/20 rounded-full p-3 text-purple-300 hover:text-white hover:bg-purple-800/80 transition-all duration-200"
                aria-label="Next episode">
                <ChevronRight className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* ── Share ───────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <Button
            onClick={handleShare}
            className="bg-linear-to-r from-[#534AB7] to-[#6B5FD8] hover:from-[#6B5FD8] hover:to-[#7F73E8] text-white px-8 py-6 text-lg rounded-lg transition-all duration-300">
            <Share2 className="mr-2 w-5 h-5" />
            Share
          </Button>
          <Button
            onClick={handleCopyLink}
            variant="outline"
            className="border-purple-400/30 text-purple-200 hover:bg-purple-500/10 px-8 py-6 text-lg rounded-lg transition-all duration-300">
            <Copy className="mr-2 w-5 h-5" />
            {copied ? "Copied!" : "Copy link"}
          </Button>
        </div>

        {/* ── Identity sections (always from Episode 1) ───────────────── */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <div className="bg-purple-950/20 border border-purple-500/20 rounded-lg p-6">
            <h3 className="text-lg font-bold mb-4 text-purple-300 font-heading">
              Your Arc
            </h3>
            <div className="space-y-4 text-sm">
              <div>
                <div className="text-purple-400 font-medium mb-1">The Wound</div>
                <div className="text-purple-100/80">{arc.character_arc.the_wound}</div>
              </div>
              <div>
                <div className="text-purple-400 font-medium mb-1">The Weapon</div>
                <div className="text-purple-100/80">{arc.character_arc.the_weapon}</div>
              </div>
              <div>
                <div className="text-purple-400 font-medium mb-1">The Destiny</div>
                <div className="text-purple-100/80">{arc.character_arc.the_destiny}</div>
              </div>
            </div>
          </div>

          <div className="bg-purple-950/20 border border-purple-500/20 rounded-lg p-6">
            <h3 className="text-lg font-bold mb-4 text-purple-300 font-heading">
              Core Stats
            </h3>
            <div className="space-y-4 text-sm">
              <div>
                <div className="text-purple-400 font-medium mb-1">Ability</div>
                <div className="text-purple-100/80">{arc.signature_move}</div>
              </div>
              <div>
                <div className="text-purple-400 font-medium mb-1">Conviction</div>
                <div className="text-purple-100/80">{arc.core_stats.conviction}</div>
              </div>
              <div>
                <div className="text-purple-400 font-medium mb-1">Visibility</div>
                <div className="text-purple-100/80">{arc.core_stats.visibility}</div>
              </div>
              <div>
                <div className="text-purple-400 font-medium mb-1">Endurance</div>
                <div className="text-purple-100/80">{arc.core_stats.endurance}</div>
              </div>
              <div>
                <div className="text-purple-400 font-medium mb-1">Impact</div>
                <div className="text-purple-100/80">{arc.core_stats.impact}</div>
              </div>
            </div>
          </div>

          <div className="bg-purple-950/20 border border-purple-500/20 rounded-lg p-6">
            <h3 className="text-lg font-bold mb-4 text-purple-300 font-heading">
              Rivals & Mentors
            </h3>
            <div className="space-y-4 text-sm">
              <div>
                <div className="text-purple-400 font-medium mb-1">
                  {arc.rivals_and_mentors.the_rival.name}
                </div>
                <div className="text-purple-100/80">
                  {arc.rivals_and_mentors.the_rival.description}
                </div>
              </div>
              <div>
                <div className="text-purple-400 font-medium mb-1">
                  {arc.rivals_and_mentors.the_mentor.name}
                </div>
                <div className="text-purple-100/80">
                  {arc.rivals_and_mentors.the_mentor.description}
                </div>
              </div>
            </div>
          </div>

          {/* Episode scene — "Episode One" for ep1, "Episode N" for ep2+ */}
          <div className="bg-purple-950/20 border border-purple-500/20 rounded-lg p-6">
            <h3 className="text-lg font-bold mb-4 text-purple-300 font-heading">
              Episode {episodeWord(ep.episodeNumber)}
            </h3>
            <div className="text-sm text-purple-100/80 leading-relaxed">
              {isEp1 ? arc.episode_one_scenario : epData.episode_scene}
            </div>
          </div>
        </div>

        {/* ── Where This Arc Is Heading ────────────────────────────────── */}
        {arc.how_their_story_ends &&
          typeof arc.how_their_story_ends !== "string" && (
            <div className="bg-purple-950/20 border border-purple-500/20 rounded-lg p-6 mb-8">
              <h3 className="text-lg font-bold mb-4 text-purple-300 font-heading">
                Where This Arc Is Heading
              </h3>
              <p className="text-xs text-purple-400/60 italic mb-6">
                Two trajectories. One is already in motion. The other requires
                you to move.
              </p>
              <div className="space-y-6">
                {Object.entries(arc.how_their_story_ends).map(([label, text]) => {
                  const isBad = label.toLowerCase().includes("bad");
                  return (
                    <div key={label} className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                            isBad ? "bg-blue-400" : "bg-green-400"
                          }`}
                        />
                        <p
                          className={`text-xs font-medium uppercase tracking-wider ${
                            isBad ? "text-blue-400" : "text-green-400"
                          }`}>
                          {isBad ? "If the pattern holds" : "If the pattern shifts"}
                        </p>
                      </div>
                      <p className="text-sm text-purple-100/80 leading-relaxed pl-3.5">
                        {text}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        {/* ── What Changed (Ep2+ only) ─────────────────────────────────── */}
        {!isEp1 &&
          epData.complications_added &&
          epData.complications_added.length > 0 && (
            <div className="bg-purple-950/20 border border-purple-500/20 rounded-lg p-6 mb-8">
              <h3 className="text-lg font-bold mb-4 text-purple-300 font-heading">
                What Changed
              </h3>
              <ul className="space-y-2">
                {epData.complications_added.map((c, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-sm text-purple-100/80">
                    <span className="mt-1.5 w-1 h-1 rounded-full bg-purple-400 shrink-0" />
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          )}

        {/* ── Inner Observation (Ep2+ only) ────────────────────────────── */}
        {!isEp1 && epData.inner_observation && (
          <div className="text-center mb-12 max-w-2xl mx-auto">
            <p className="text-xs uppercase tracking-widest text-purple-500 mb-4">
              Inner Observation
            </p>
            <p className="text-lg text-purple-200/80 italic leading-relaxed">
              &quot;{epData.inner_observation}&quot;
            </p>
          </div>
        )}

        {/* ── Weekly Mission ───────────────────────────────────────────── */}
        {mission && (
          <div className="bg-linear-to-r from-purple-950/40 to-purple-900/40 border border-purple-400/30 rounded-lg p-8 mb-12">
            <div className="text-sm text-purple-400 mb-3 tracking-wide uppercase">
              Your mission this week
            </div>
            <h3 className="text-2xl font-bold mb-4 text-white font-heading">
              {mission.title}
            </h3>
            <p className="text-purple-100/90 mb-4 leading-relaxed">
              {mission.description}
            </p>
            <div className="text-sm text-purple-300/80 italic">{mission.stakes}</div>
          </div>
        )}

        {/* ── Footer ──────────────────────────────────────────────────── */}
        {isEp1 ? (
          <>
            <div className="bg-purple-950/20 border border-purple-500/10 rounded-lg p-5 max-w-lg mx-auto text-center mb-12">
              <p className="text-xs uppercase tracking-[0.15em] text-purple-500 mb-2">
                Your arc lives here
              </p>
              <p className="text-xs text-purple-400/60 mb-3">
                Save this link. Episode 2 begins from your arc page.
              </p>
              <code className="text-xs text-purple-300/70 bg-purple-950/40 px-3 py-1.5 rounded font-mono break-all">
                {shareUrl}
              </code>
            </div>

            <div className="text-center space-y-6">
              <div
                className="border border-purple-500/15 rounded-lg p-6 max-w-lg mx-auto"
                style={{ background: "rgba(83, 74, 183, 0.06)" }}>
                <p className="text-xs uppercase tracking-[0.15em] text-purple-500 mb-4">
                  Episode 02 · The Confrontation
                </p>
                <p className="text-sm text-purple-300/80 leading-relaxed mb-4">
                  Episode 2 picks up from wherever your mission takes you — not
                  just if you complete it, but what it cost you, what you avoided,
                  and what surprised you. The arc follows what actually happened,
                  not what was supposed to.
                </p>
                <p className="text-xs text-purple-400/50 italic">
                  Come back with what this week taught you. That&apos;s where
                  Episode 2 begins.
                </p>
              </div>
              <Button
                variant="outline"
                className="border-purple-400/30 text-purple-200 hover:bg-purple-500/10 px-8 py-4 rounded-lg transition-all duration-300"
                asChild>
                <Link href="/">Begin a different arc</Link>
              </Button>
            </div>
          </>
        ) : (
          <div className="text-center">
            <Button
              variant="outline"
              className="border-purple-400/30 text-purple-200 hover:bg-purple-500/10 px-8 py-4 rounded-lg transition-all duration-300"
              asChild>
              <Link href="/dashboard">Back to dashboard</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

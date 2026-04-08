// src/components/arc/ArcReveal.tsx
"use client";

import { useState, useEffect } from "react";
import { Share2, Copy } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import ArcCard from "./ArcCard";
import { GeneratedArc } from "@/types/arc";

interface ArcRevealProps {
  arc: GeneratedArc;
  arcId: string;
  shareUrl: string;
}

export default function ArcReveal({
  arc,
  arcId,
  shareUrl,
}: ArcRevealProps) {
  const [isVisible, setIsVisible] = useState(false);
  // Emergent used toast for copy feedback — we use local state instead
  // since we don't have sonner installed and it's cleaner anyway.
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Emergent uses 100ms — matches their exact fade-in timing
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  async function handleShare() {
    if (navigator.share) {
      await navigator.share({
        title: `My Arc: ${arc.character_name}`,
        text: arc.opening_episode_quote,
        url: shareUrl,
      });
    } else {
      handleCopyLink();
    }
  }

  async function handleCopyLink() {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="min-h-screen bg-forge-bg-deepest text-white pt-4 px-6 pb-8">
      <div
        className={`max-w-5xl mx-auto transition-opacity duration-1000 ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}>
        {/* ── Header ─────────────────────────────────────────────────
            Exact structure from Emergent: Sparkles icon + ARCFORGE
            wordmark centred, then episode label, then the character
            name at display size, then archetype pill, then the quote. */}
        <div className="text-center mb-12">
          <div className="text-sm text-purple-400 mb-4 tracking-wide">
            EPISODE 01 · THE AWAKENING
          </div>

          {/* Character name — Emergent uses text-5xl lg:text-6xl font-bold
              with Outfit via inline style. We use font-heading utility
              which maps to the same Outfit variable loaded in layout.tsx. */}
          <h1 className="text-5xl lg:text-6xl font-bold mb-4 font-heading">
            {arc.character_name}
          </h1>

          {/* Archetype pill — single pill, no rarity badge alongside it.
              This matches Emergent's exact header structure. */}
          <div className="inline-block px-4 py-2 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-200 text-sm mb-6">
            {arc.archetype}
          </div>

          {/* The opening quote — full text, not truncated like the card.
              This is the screenshot moment. Emergent gives it text-xl
              with generous max-width and line-height. */}
          <p className="text-xl text-purple-200/80 italic max-w-3xl mx-auto leading-relaxed">
            &quot;{arc.opening_episode_quote}&quot;
          </p>
        </div>

        {/* ── Arc Card ───────────────────────────────────────────────
            Centred with flex justify-center, generous mb-12 below.
            We pass arc and arcId — our ArcCard handles the rest. */}
        <div className="flex justify-center mb-12">
          <ArcCard arc={arc} arcId={arcId} />
        </div>

        {/* ── Share buttons ──────────────────────────────────────────
            Emergent's exact button styling: gradient primary for Share,
            outline secondary for Copy. We replace toast with copied state
            so the Copy button gives inline feedback without a toast library. */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <Button
            onClick={handleShare}
            className="bg-linear-to-r from-[#534AB7] to-[#6B5FD8] hover:from-[#6B5FD8] hover:to-[#7F73E8] text-white px-8 py-6 text-lg rounded-lg transition-all duration-300">
            <Share2 className="mr-2 w-5 h-5" />
            Share my arc
          </Button>
          <Button
            onClick={handleCopyLink}
            variant="outline"
            className="border-purple-400/30 text-purple-200 hover:bg-purple-500/10 px-8 py-6 text-lg rounded-lg transition-all duration-300">
            <Copy className="mr-2 w-5 h-5" />
            {copied ? "Copied!" : "Copy link"}
          </Button>
        </div>

        {/* ── Character details grid ─────────────────────────────────
            Emergent uses md:grid-cols-2 gap-8 mb-16 with rounded-lg
            panels. Note rounded-lg (not rounded-xl) — this matches
            Emergent exactly and is slightly less rounded than what
            we had before. */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {/* Your Arc — wound, weapon, destiny */}
          <div className="bg-purple-950/20 border border-purple-500/20 rounded-lg p-6">
            <h3 className="text-lg font-bold mb-4 text-purple-300 font-heading">
              Your Arc
            </h3>
            <div className="space-y-4 text-sm">
              <div>
                <div className="text-purple-400 font-medium mb-1">
                  The Wound
                </div>
                <div className="text-purple-100/80">
                  {arc.character_arc.the_wound}
                </div>
              </div>
              <div>
                <div className="text-purple-400 font-medium mb-1">
                  The Weapon
                </div>
                <div className="text-purple-100/80">
                  {arc.character_arc.the_weapon}
                </div>
              </div>
              <div>
                <div className="text-purple-400 font-medium mb-1">
                  The Destiny
                </div>
                <div className="text-purple-100/80">
                  {arc.character_arc.the_destiny}
                </div>
              </div>
            </div>
          </div>

          {/* Core Stats — descriptive sentences, not numbers.
              The numeric stats live on the card — these are the
              qualitative assessments Claude wrote about each stat. */}
          <div className="bg-purple-950/20 border border-purple-500/20 rounded-lg p-6">
            <h3 className="text-lg font-bold mb-4 text-purple-300 font-heading">
              Core Stats
            </h3>
            <div className="space-y-4 text-sm">
              <div>
                <div className="text-purple-400 font-medium mb-1">
                  Ability
                </div>
                <div className="text-purple-100/80">
                  {arc.signature_move}
                </div>
              </div>
              <div>
                <div className="text-purple-400 font-medium mb-1">
                  Conviction
                </div>
                <div className="text-purple-100/80">
                  {arc.core_stats.conviction}
                </div>
              </div>
              <div>
                <div className="text-purple-400 font-medium mb-1">
                  Visibility
                </div>
                <div className="text-purple-100/80">
                  {arc.core_stats.visibility}
                </div>
              </div>
              <div>
                <div className="text-purple-400 font-medium mb-1">
                  Endurance
                </div>
                <div className="text-purple-100/80">
                  {arc.core_stats.endurance}
                </div>
              </div>
              <div>
                <div className="text-purple-400 font-medium mb-1">
                  Impact
                </div>
                <div className="text-purple-100/80">
                  {arc.core_stats.impact}
                </div>
              </div>
            </div>
          </div>

          {/* Rivals & Mentors */}
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

          {/* Episode One scenario */}
          <div className="bg-purple-950/20 border border-purple-500/20 rounded-lg p-6">
            <h3 className="text-lg font-bold mb-4 text-purple-300 font-heading">
              Episode One
            </h3>
            <div className="text-sm text-purple-100/80 leading-relaxed">
              {arc.episode_one_scenario}
            </div>
          </div>
        </div>

        {/* ── How the story ends ─────────────────────────────────────
            Emergent didn't have this panel — it's an addition from our
            design that shows both possible endings. We keep it because
            it's genuinely compelling content, but we handle the dual
            format (string from Claude, object from GPT-4o) gracefully. */}
        {arc.how_their_story_ends && (
          <div className="bg-purple-950/20 border border-purple-500/20 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-bold mb-4 text-purple-300 font-heading">
              Where This Arc Is Heading
            </h3>
            <p className="text-xs text-purple-400/60 italic mb-6">
              Two trajectories. One is already in motion. The other
              requires you to move.
            </p>

            {typeof arc.how_their_story_ends === "string" ? (
              <p className="text-sm text-purple-100/80 leading-relaxed whitespace-pre-line">
                {arc.how_their_story_ends}
              </p>
            ) : (
              <div className="space-y-6">
                {Object.entries(arc.how_their_story_ends).map(
                  ([label, text]) => {
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
                              isBad
                                ? "text-blue-400"
                                : "text-green-400"
                            }`}>
                            {isBad
                              ? "If the pattern holds"
                              : "If the pattern shifts"}
                          </p>
                        </div>
                        <p className="text-sm text-purple-100/80 leading-relaxed pl-3.5">
                          {text}
                        </p>
                      </div>
                    );
                  },
                )}
              </div>
            )}
          </div>
        )}

        {/* ── Weekly Mission ─────────────────────────────────────────
            Emergent's exact styling: gradient background panel with
            YOUR MISSION THIS WEEK label, bold title, description,
            and italic stakes. This is the emotional conclusion of
            the reveal — it bridges the arc analysis to real life action. */}
        {arc.episode_one_mission && (
          <div className="bg-linear-to-r from-purple-950/40 to-purple-900/40 border border-purple-400/30 rounded-lg p-8 mb-12">
            <div className="text-sm text-purple-400 mb-3 tracking-wide uppercase">
              Your mission this week
            </div>
            <h3 className="text-2xl font-bold mb-4 text-white font-heading">
              {arc.episode_one_mission.title}
            </h3>
            <p className="text-purple-100/90 mb-4 leading-relaxed">
              {arc.episode_one_mission.description}
            </p>
            <div className="text-sm text-purple-300/80 italic">
              {arc.episode_one_mission.stakes}
            </div>
          </div>
        )}

        {/* Arc permalink — the minimum viable "save your progress" 
        mechanism before auth exists. Clear, honest, functional.
        The user controls their continuity by keeping this URL. */}
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

        {/* ── Genre vibe ─────────────────────────────────────────────
            Not in Emergent's reveal but worth keeping — it's the most
            shareable debate-starter on the page and costs nothing to show. */}
        {/* {arc.if_they_were_a_genre && (
          <div className="text-center mb-12">
            <p className="text-xs uppercase tracking-widest text-purple-500 mb-2">
              If you were an anime
            </p>
            <p className="text-sm italic text-purple-200/70 max-w-lg mx-auto">
              {arc.if_they_were_a_genre}
            </p>
          </div>
        )} */}

        {/* ── Bottom CTA ─────────────────────────────────────────────
            Emergent uses a Button with onClick navigate('/') —
            we use Link href="/" which is the Next.js equivalent.
            Both produce the same visual result and the same behaviour. */}
        <div className="text-center space-y-6">
          {/* Episode 2 teaser — communicates that the product is
          serialised without overpromising on timing or features.
          The mission completion framing creates a genuine hook:
          the user feels that their real-world action this week
          is what earns the next episode, which is the correct
          product loop even before the backend supports it. */}
          <div
            className="border border-purple-500/15 rounded-lg p-6 max-w-lg mx-auto"
            style={{ background: "rgba(83, 74, 183, 0.06)" }}>
            <p className="text-xs uppercase tracking-[0.15em] text-purple-500 mb-4">
              Episode 02 · The Confrontation
            </p>

            <p className="text-sm text-purple-300/80 leading-relaxed mb-4">
              Episode 2 picks up from wherever your mission takes you
              — not just if you complete it, but what it cost you,
              what you avoided, and what surprised you. The arc
              follows what actually happened, not what was supposed
              to.
            </p>

            <p className="text-xs text-purple-400/50 italic">
              Come back with what this week taught you. That&apos;s
              where Episode 2 begins.
            </p>
          </div>

          <Button
            variant="outline"
            className="border-purple-400/30 text-purple-200 hover:bg-purple-500/10 px-8 py-4 rounded-lg transition-all duration-300"
            asChild>
            <Link href="/">Begin a different arc</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

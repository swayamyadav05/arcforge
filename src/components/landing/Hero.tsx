// src/components/landing/Hero.tsx

// Required because motion/react is a client-only animation library.
// Any component that uses browser APIs, hooks, or animation libraries
// must declare itself as a client component in Next.js App Router.
"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getOrCreateFingerprint } from "@/lib/fingerprint";
import { useEffect, useState } from "react";
// Point to your existing ArcCard, not the Vite version.
// Note: ArcCard uses inline styles throughout (required for @vercel/og
// compatibility), so it works fine inside a client component.
// import ArcCard from "@/components/arc/ArcCard";
// We use the real arc data from our smoke test as the preview card content.
// This is hardcoded intentionally — the landing page preview should always
// show the same compelling example rather than a random or empty card.
import { GeneratedArc } from "@/types/arc";
import { TypingAnimation } from "@/components/ui/typing-animation";
import Image from "next/image";
import ArcCard from "../arc/ArcCard";
import ArcCardInteractive from "../arc/ArcCardInteractive";

// A curated sample arc for the landing page preview card.
// This is the "The Code Hermit" arc we generated during testing —
// it's specific enough to feel real and compelling enough to make
// visitors want their own arc. Update this if you generate a
// better example arc in the future.
const SAMPLE_ARC: GeneratedArc = {
  character_name: "The Code Hermit",
  archetype: "The Unseen Architect",
  opening_episode_quote:
    "I build doors for others to walk through, then stand behind them, unseen. Not humility. Habit.",
  character_arc: {
    the_wound: "You mistake invisibility for safety.",
    the_weapon: "Your solitude is your workshop.",
    the_destiny: "Lead from the front. Let your work have a voice.",
  },
  episode_one_scenario:
    "You've built a tool that solves a problem 10,000 developers have. It's been sitting in a private repo for eight months, 80% complete. Today, someone you respect casually mentions they're trying to solve that exact problem manually. You have two choices: send them the link, or stay silent and offer vague advice. The episode ends on your hand hovering over the 'send' button. Cut to black. Preview: 'Next time: The Hermit learns that shipping isn't the same as surrendering.'",
  rivals_and_mentors: {
    the_rival: {
      name: "The Performance Artist",
      description: "Everything you're not.",
    },
    the_mentor: {
      name: "The Burned-Out Prodigy",
      description: "A warning, not a guide.",
    },
  },
  core_stats: {
    conviction: "High when alone, crumbles under observation.",
    visibility: "Deliberately minimal.",
    endurance: "Exceptional.",
    impact: "Massive gap. Moving pebbles in private.",
  },
  signature_move:
    "The Phantom Commit — code that improves lives without a name attached.",
  character_flaw_that_is_also_their_strength:
    "You never finish because finishing means shipping.",
  the_truth_they_avoid:
    "Your voice doesn't need to be perfect. It needs to be yours.",
  how_their_story_ends:
    "BAD END: A hard drive full of 80% projects. GOOD END: You ship something broken and let others help you fix it.",
  if_they_were_a_genre:
    "Mushishi, but the wanderer never wanders — the spirits come to them.",
  rarity: "Mythic",
  numeric_stats: { resolve: 84, chaos: 71, empathy: 68, focus: 79 },
  episode_one_mission: {
    title: "Break the Silence Seal",
    description: "Share one piece of your work publicly this week.",
    stakes:
      "Do it: you learn being seen doesn't destroy you. Don't: the gap widens.",
  },
};

type ArcStatusResponse = {
  latestArcId?: string | null;
};

export default function Hero() {
  const [latestArcId, setLatestArcId] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;

    const hydrateLatestArc = async () => {
      try {
        const localArcId = localStorage.getItem(
          "arcforge_latest_arc_id",
        );

        if (localArcId && !isCancelled) {
          setLatestArcId(localArcId);
        }

        const fingerprint = await getOrCreateFingerprint();

        const response = await fetch("/api/arc/status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fingerprint }),
        });

        if (!response.ok) {
          return;
        }

        const data = (await response.json()) as ArcStatusResponse;

        if (isCancelled || !data.latestArcId) {
          return;
        }

        setLatestArcId(data.latestArcId);
        localStorage.setItem(
          "arcforge_latest_arc_id",
          data.latestArcId,
        );
      } catch {
        // If status lookup fails, we keep the default hero CTAs.
      }
    };

    hydrateLatestArc();

    return () => {
      isCancelled = true;
    };
  }, []);

  return (
    <section className="max-w-screen-2xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center px-4 sm:px-6 lg:px-8 pt-10 pb-16 overflow-x-clip">
      {/* Left column — animated slide-in from the left on page load.
          The animation values match what Figma AI Studio generated exactly.
          duration defaults to 0.6s which feels right for a landing page. */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="space-y-8">
        {/* Category pill — establishes product context before the headline */}
        <div className="inline-flex items-center bg-[rgba(83,74,183,0.15)] border border-[rgba(83,74,183,0.3)] rounded-[20px] py-1 px-3.5 mb-2">
          <span className="text-[11px] font-medium tracking-widest uppercase text-[#D8B4FE] font-body">
            AI-Powered Anime Identity
          </span>
        </div>
        {/* Main headline — two lines with distinct colour treatment.
            First line in off-white, second line in brand purple italic.
            font-extrabold matches the Figma weight. The clamp() keeps
            the size responsive without needing multiple breakpoint classes. */}
        <h1 className="font-heading font-extrabold leading-[1.1] tracking-tight text-[clamp(2.5rem,6vw,4.5rem)] text-[#EEEDFE]">
          You are not a viewer. <br />
          <span className="text-forge-purple-400 italic">
            You are the protagonist.
          </span>
        </h1>

        {/* Subheadline — lighter weight, muted colour, generous line height
            so it breathes below the large headline. */}
        <TypingAnimation
          as="p"
          duration={40}
          startOnView={true}
          showCursor={true}
          blinkCursor={true}
          cursorStyle="line"
          className="leading-relaxed text-[#AFA9EC]"
          style={{
            fontSize: "clamp(1.125rem, 2vw, 1.375rem)",
            fontFamily: "var(--font-heading)",
            fontWeight: 500,
          }}>
          Your story is already in motion. Episode 1 begins here — and
          the arc you live from now is yours to write.
        </TypingAnimation>

        {/* Button row — primary CTA uses shadcn Button with Link for
            client-side navigation. asChild tells shadcn to render the
            Button's visual treatment on the Link element rather than
            wrapping Link inside a button (which would be invalid HTML). */}
        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          {latestArcId && (
            <Button variant="secondary" size="lg" asChild>
              <Link href={`/arc/${latestArcId}`}>
                Continue my arc
              </Link>
            </Button>
          )}

          <Button variant="default" size="lg" asChild>
            <Link href="/awakening">Forge my arc →</Link>
          </Button>

          {/* Secondary button — outline variant, links to the sample arc
              we generated during testing so visitors can see a real output. */}
          <Button variant="outline" size="lg" asChild>
            <Link href="/arc/i38CqFEH">See a sample arc</Link>
          </Button>
        </div>

        {/* Social proof row — three overlapping avatar circles with
            a count. Using picsum for placeholder avatars for now.
            Replace with real user avatars or an abstract pattern later. */}
        <div className="flex items-center gap-4 pt-8 text-[#D8B4FE]">
          <div className="flex -space-x-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="w-10 h-10 rounded-full overflow-hidden border-2 border-forge-bg-deepest bg-forge-bg-raised">
                <Image
                  src={`https://picsum.photos/seed/anime${i}/100/100`}
                  alt="Arc protagonist"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                  width={100}
                  height={100}
                />
              </div>
            ))}
          </div>
          <span className="text-sm font-medium tracking-wide uppercase text-[#D8B4FE]">
            Join the first protagonists forging their arc
          </span>
        </div>
      </motion.div>

      {/* Right column — stacked card effect, background cards peek left */}
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative flex justify-center lg:justify-end overflow-x-clip">
        {/* Atmospheric glow behind the desktop card stack */}
        <div className="absolute -top-15 -right-15 w-100 h-100 blur-[100px] rounded-full pointer-events-none z-0 hidden lg:block" />

        {/* Mobile/tablet card — single centered card to avoid horizontal overflow */}
        <div className="lg:hidden w-full max-w-85 mx-auto">
          <ArcCardInteractive
            arc={SAMPLE_ARC}
            arcId="i38CqFEH"
            shareUrl="https://arcforge.me/arc/i38CqFEH"
            compact={true}
          />
        </div>

        {/* Desktop card stack */}
        <div className="hidden lg:block relative w-125 h-150 pl-15 pt-10">
          <div className="absolute top-5 left-0 z-1 -rotate-[5deg] -translate-x-7.5 opacity-[0.45] pointer-events-none">
            <ArcCard
              arc={SAMPLE_ARC}
              arcId="i38CqFEH"
              compact={true}
            />
          </div>

          <div className="absolute top-2.5 left-5 z-2 -rotate-[2.5deg] -translate-x-3.75 opacity-[0.65] pointer-events-none">
            <ArcCard
              arc={SAMPLE_ARC}
              arcId="i38CqFEH"
              compact={true}
            />
          </div>

          <div
            style={{
              position: "absolute",
              top: "0px",
              left: "60px",
              zIndex: 3,
            }}>
            <ArcCardInteractive
              arc={SAMPLE_ARC}
              arcId="i38CqFEH"
              shareUrl="https://arcforge.me/arc/i38CqFEH"
              compact={true}
            />
          </div>
        </div>
      </motion.div>
    </section>
  );
}

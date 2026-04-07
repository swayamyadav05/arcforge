// src/components/landing/Navbar.tsx
"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { usePathname, useSearchParams } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  // We check if the current path starts with "/quiz" rather than
  // strict equality so this also catches future subroutes like
  // /quiz/generating or /quiz/error if we add them later.
  const isQuizRoute = pathname?.startsWith("/quiz");
  const isPublicArcPage =
    pathname?.startsWith("/arc") && !searchParams.get("new");

  if (isPublicArcPage) return null;

  return (
    // Slides down from above on page load — the entrance animation
    // makes the navbar feel like it's descending to take its position,
    // which fits the cinematic tone of the product nicely.
    <motion.nav
      initial={isQuizRoute ? { y: 0 } : { y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50 bg-[rgba(10,6,18,0.8)] backdrop-blur-md border-b border-white/5">
      <div className="flex justify-between items-center px-6 py-5 w-full max-w-screen-2xl mx-auto">
        {/* Logo — uppercase, tight tracking, links back to home.
            Using Link here means navigating to "/" triggers Next.js
            client-side routing rather than a full page reload. */}
        <Link href="/" className="no-underline">
          <span className="font-heading font-extrabold tracking-tighter uppercase text-[22px] text-[#EEEDFE]">
            ArcForge
          </span>
        </Link>

        {/* Right side — conditionally renders based on current route.
            On the quiz route we show nothing because the user is in
            a focused task flow and marketing links would distract them.
            On all other routes we show the standard marketing nav items. */}
        {!isQuizRoute && (
          <div className="hidden md:flex items-center gap-6">
            <Link
              href="/arc/i38CqFEH"
              className="text-sm font-medium text-[#D8B4FE] no-underline hover:text-[#EEEDFE] transition-colors duration-200">
              See a sample arc
            </Link>
            <Button size="sm" asChild>
              <Link href="/quiz">Forge my arc</Link>
            </Button>
          </div>
        )}
      </div>
    </motion.nav>
  );
}

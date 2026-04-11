# ArcForge

> **You are not a viewer. You are the protagonist.**

ArcForge is an episodic anime narrative platform where your real life is the source material. You don't receive a personality report — you begin living a story. Each episode is shaped by what you actually did, what you avoided, and what surprised you in the week before. The arc follows what happened, not what was supposed to.

Episode 1 is the awakening. The moment your story begins.

---

## The Concept

Most people move through their lives as supporting characters in other people's stories — present, capable, often essential, but not quite the protagonist of their own narrative. ArcForge names that pattern, gives it a character arc, and then asks: what happens next?

The product is built around a core belief borrowed from anime as a storytelling tradition: the most compelling protagonists are not the most talented or the most confident. They are the ones whose wound and weapon are the same thing — whose greatest limitation, reframed, becomes their defining strength. Mob Psycho 100's Mob is emotionally suppressed because his power is tied to his feelings. Ping Pong's Smile has abandoned ambition as a survival mechanism that once served him. Vinland Saga's Thorfinn is driven by revenge until the day he understands that the revenge is the cage.

ArcForge finds that structure in a real person's real answers, and names it in the first-person voice of their own inner narrator.

Episode 1 surfaces the wound, the weapon, and the mission — the specific real-world action that bridges the gap between who the protagonist is right now and who they are becoming. Episode 2 picks up from wherever that mission takes them. Not just whether they completed it, but what it cost them, what they avoided, and what surprised them. The story follows what actually happened.

This is the product's long-term premise: a living narrative that compounds over time, shaped by real choices, written in the voice of a narrator who sees the protagonist more clearly than they see themselves.

---

## What Happens in Episode 1

A new user arrives at arcforge.me and moves through 8 questions designed to surface the specific emotional patterns, contradictions, and unspoken truths that define their protagonist arc right now. These are not personality inventory items. They are the kind of questions a good director would ask an actor before filming the most important scene of their career.

Claude then generates a complete character arc — a poetic codename, an archetype, an opening episode quote written in the protagonist's own inner voice, a wound and weapon analysis in first person, four numeric stats derived honestly from the answers, rivals and mentors drawn from what was actually said, an episode one scenario that ends on a cliffhanger, two possible future trajectories framed without moral judgment, and a weekly mission targeting the exact thing the protagonist is avoiding.

The generated arc is persisted permanently with a shareable URL. The Arc Card — a collectible-style card showing the character name, archetype, numeric stats, rival, mentor, and locked final form — serves as the primary viral sharing mechanic. When shared to Discord, Twitter, or iMessage, the Open Graph preview renders the Arc Card as a 1200×630 PNG, designed to stop the scroll and create one question: "What would mine say?"

The public share page shows enough to create desire in a visitor without exposing the private depth of the wound and weapon analysis, which belongs only to the person who answered the questions. The Arc Card is the teaser trailer, not the film.

---

## Tech Stack

ArcForge is a Next.js 15 App Router monolith with a PostgreSQL database on Neon, deployed to Vercel. The entire application — frontend, backend API routes, and OG image generation — lives in a single repository and deploys as one unit.

The frontend uses Next.js 15 with the App Router, TypeScript, Tailwind CSS 4, and shadcn/ui for accessible component primitives. Framer Motion handles the cinematic reveal animations. The design system uses Outfit for headings and Inter for body text, with a dark purple palette built around `#0a0612` backgrounds and `#534AB7` brand purple.

The backend API routes handle arc generation with rate limiting using both IP address and FingerprintJS browser fingerprint, enforcing one arc per 24-hour window per device. The generate endpoint calls Claude Sonnet 4.5 with a carefully engineered system prompt that produces first-person narrative arcs in the style of Shinichiro Watanabe — specific, uncomfortable, and never generic.

The database is Neon PostgreSQL with Prisma 7 as the ORM. Three tables handle the product's data needs: `arcs` stores the generated arc data as JSON alongside the user's raw answers, `rate_limits` tracks IP and fingerprint pairs across the 24-hour window, and `api_usage_logs` records token counts and cost per generation.

OG image generation uses `@vercel/og` with `ImageResponse` to render the Arc Card as a 1200×630 PNG at `/api/og/[id]`.

---

## Project Structure

```
src/
├── app/
│   ├── layout.tsx                  # Root layout — fonts, global navbar
│   ├── page.tsx                    # Landing page
│   ├── quiz/
│   │   └── page.tsx                # Quiz flow entry point
│   └── arc/[id]/
│       └── page.tsx                # SSR — routes between owner reveal and public view
│   └── api/
│       ├── arc/generate/           # POST — rate limit, generate, persist
│       ├── arc/[id]/               # GET — returns arc JSON
│       └── og/[id]/                # GET — renders Arc Card as PNG
├── components/
│   ├── landing/                    # Navbar, Hero, Features, CTA, Footer
│   ├── quiz/                       # QuizFlow, QuestionCard
│   └── arc/                        # ArcCard, ArcReveal, ArcCardInteractive
├── lib/
│   ├── prisma.ts                   # Singleton PrismaClient with Neon pg adapter
│   ├── claude.ts                   # Arc generation — system prompt and API call
│   └── rateLimit.ts                # IP + fingerprint rate limit logic
└── types/arc.ts                    # GeneratedArc interface — source of truth
```

---

## Key Architecture Decisions

Several decisions in this codebase are non-obvious and worth understanding before modifying anything.

The ArcCard component uses inline styles exclusively because it renders in two completely different environments simultaneously — the browser and Vercel's OG image renderer. The OG renderer does not load external stylesheets, which means any Tailwind class on ArcCard would work in the browser and produce nothing in the OG image. Every other component uses Tailwind. ArcCard is the single exception, and the reason is purely technical.

Sequential writes are used instead of Prisma transactions in the arc generate route because the Claude API call takes 30-45 seconds. Neon's PgBouncer connection pooler reclaims connections during idle periods, causing P2028 timeouts when the code finally reaches a transaction block. Two sequential Prisma calls after Claude responds each acquire and release their own connection immediately. The cost log write uses `.catch()` to swallow failures gracefully so a logging failure never reaches the user.

The `?new=true` query parameter distinguishes the owner's full animated reveal from the public share view. Both experiences live at `/arc/[id]` but render completely different content. Open Graph crawlers hit the base URL without query parameters and always see the public view — which is correct because the OG metadata should represent the arc's public identity, not the owner's private analysis.

The system prompt in `src/lib/claude.ts` is the product's core differentiator. It instructs Claude to write in first person throughout all prose fields, to derive stats honestly from the answers rather than flatteringly, to never use the words "brave" or "kind", and to write missions that are slightly uncomfortable because they target the exact thing the protagonist is avoiding. Generic missions are explicitly banned.

---

## Environment Variables

```bash
# Neon PostgreSQL — pooled URL for queries, direct URL for migrations
DATABASE_URL="postgresql://user:password@host/arcforge?pgbouncer=true&sslmode=require"
DIRECT_URL="postgresql://user:password@direct-host/arcforge?sslmode=require"

# Anthropic — Claude Sonnet 4.5
ANTHROPIC_API_KEY="sk-ant-..."

# App URL — used for share URL and OG image URL construction
NEXT_PUBLIC_APP_URL="http://localhost:3000"
# Set to https://arcforge.me in Vercel production environment variables
```

---

## Getting Started

```bash
git clone https://github.com/yourusername/arcforge.git
cd arcforge
npm install
cp .env.example .env.local
# Fill in your environment variables
npx prisma migrate deploy
npm run dev
```

The application runs at `http://localhost:3000`. Navigate to `/awakening` to go through the full arc generation flow, or visit `/arc/-eTpPVSp` to see a sample arc's public share page.

---

## Roadmap

Episode 1 is live. The awakening is complete.

Episode 2 requires authentication so the product knows who is returning, what episode they are on, and what happened in the week since their last arc. Episode 2 generation will receive both the Episode 1 arc data and a new set of questions about what happened with the mission — not a fresh start, but a continuation. Claude will know the protagonist's established wound, weapon, and archetype, and will write forward from that foundation.

Beyond Episode 2, the vision includes arc battles where two protagonists' arcs are analysed for compatibility and narrative conflict, a community layer where users share their episodes and missions as a form of self-improvement logging in a cool anime narrative format, and a premium tier that unlocks the final form reveal and deeper arc analysis.

The product is a mirror that gets more accurate the longer you hold it. Each episode compounds on the last. The arc that emerges after six months of honest answers is a different — and more useful — thing than the arc from a single sitting.

---

## Built By

ArcForge was designed and built by [Swayam Yadav](https://swayamyadav.me). Arc generation is powered by Anthropic's Claude Sonnet 4.5.

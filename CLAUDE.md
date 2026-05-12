# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- Install dependencies: `npm install`
- Start development server: `npm run dev`
- Build for production: `npm run build`
- Start production server: `npm run start`
- Lint code: `npm run lint`
- Run Prisma migrations: `npx prisma migrate deploy`
- Generate Prisma client: `npx prisma generate`
- View Prisma Studio: `npx prisma studio`

## Project Architecture

### Core Stack
- **Framework**: Next.js 16 App Router with React 19 and TypeScript
- **Styling**: Tailwind CSS 4 with shadcn/ui components
- **Database**: Neon PostgreSQL with Prisma 7 ORM (client generated to `src/app/generated/prisma`)
- **AI Integration**: Anthropic SDK — `claude-sonnet-4-6` for generation, `claude-haiku-4-5-20251001` for extraction
- **Authentication**: Better Auth with magic links via Resend
- **Analytics**: PostHog for event tracking
- **Error Tracking**: Sentry configured for edge and server environments
- **OG Image Generation**: `@vercel/og` with `ImageResponse` for Arc Cards

### Key Data Flow

**Episode 1 (Arc creation):**
1. Authenticated user answers 8 awakening questions
2. `POST /api/arc/generate` validates, rate-limits, calls `generateArc()` (single Claude call via `forge_episode` tool)
3. Atomic transaction: creates `ArcSeries`, `Arc` (ep 1), `StoryBible`, `StoryEvent`
4. Rate limit slot consumed after successful save; cost logged outside transaction
5. Owner session cookie set; redirect to `/arc/[id]?new=true`

**Episode N (Series continuation):**
1. User submits a `Reflection` during the 7-day window between episodes
2. `POST /api/arc/series/[seriesId]/generate-next` enforces auth, ownership, 7-day window, and hard-flag gate
3. Calls `generateEpisodeN()` — three sequential Claude calls:
   - **Plan** (Sonnet): reads bible + reflection → returns `EpisodeNPlan` via `plan_episode_n` tool
   - **Draft** (Sonnet): reads bible + plan → returns `EpisodeNOutput` via `draft_episode_n` tool
   - **Extract + Critic** (Haiku): reads bible + draft → returns `StateDelta` + `CriticOutput` via `extract_episode_n` tool
4. `applyStateDelta()` produces an updated `StoryBibleShape` (pure function, no mutation)
5. Atomic transaction: creates new `Arc`, updates `StoryBible`, updates `ArcSeries`, appends `StoryEvent`s
6. Reflection deleted (best-effort, outside transaction); usage logged per call

**Arc display:**
- `src/app/arc/[id]/page.tsx` — owner vs. public view branch via cookie session
- `src/app/api/og/[id]/route.tsx` — generates 1200×630 OG PNG (Edge runtime)

### Database Schema

All models are in `prisma/schema.prisma`. Key relationships:

```
User → ArcSeries[] → Arc[] (episodes)
              ↓           
         StoryBible (1:1, versioned)
         Reflection (1:1, deleted after generation)
         StoryEvent[] (append-only log)
```

| Model | Purpose |
|---|---|
| `ArcSeries` | Container for one user's ongoing story; tracks `currentEpisode`, `lastEpisodeAt`, `criticNotes` |
| `Arc` | One episode; stores raw `answers`, `arcData` (JSON), `episodeNumber`, `daysSincePrev` |
| `StoryBible` | Canonical narrative state (`StoryBibleShape`); updated via `applyStateDelta` after every episode |
| `Reflection` | In-progress user reflection; deleted on successful next-episode generation |
| `StoryEvent` | Append-only log of narrative events; enables time-travel debugging |
| `RateLimit` | IP + fingerprint 24-hour window; `ARC_DAILY_LIMIT` env var overrides (default: 1 prod, 10 dev) |
| `ApiUsageLog` | Per-arc token counts and USD cost |

### Story Bible Shape

`StoryBibleShape` (defined in `src/types/story-bible.ts`) is the canonical narrative state for a series:
- `world` — genre, tone, hard_rules
- `characters.protagonist` — name, archetype, description, wounds, complications, possessions, knowledge_state
- `relationships`, `unresolved_threads`, `resolved_threads`
- `timeline` — one entry per episode (used as Episode N summary input)
- `established_facts` — canonical facts with validity ranges
- `emotional_arc`, `motifs`, `style_guide`

The bible is bootstrapped by `forge_episode` tool on Episode 1, then mutated by `applyStateDelta` (`src/lib/bible/apply-delta.ts`) after each subsequent episode.

### Critical Conventions

- **Server Components by Default**: Only add `"use client"` when interaction/state truly requires it
- **No Client Event Handlers in Server Components**: Use CSS hover classes instead of `onMouseEnter`/`onMouseLeave`
- **Stable API Responses**: Validate input early, return typed error codes (`GenerateArcErrorCode`, `GenerateNextErrorCode`), never leak internal metadata
- **Arc Generation Safety**: Claude is called outside DB transactions; transactions only wrap fast writes after Claude responds
- **OG Compatibility**: `ArcCard` uses inline styles (not Tailwind) to work in both browser and `@vercel/og` environments
- **Ownership Verification**: Cookie-based sessions in `src/lib/ownerSession.ts` for legacy arc access; Better Auth session for all Episode N operations
- **Hard Flag Gate**: If `ArcSeries.criticNotes` contains `hard_flags`, the next episode generation is blocked until resolved
- **Optimistic Locking**: `StoryBible.version` is incremented on every update to catch concurrent modifications

### Important Files

| File | Role |
|---|---|
| `src/lib/claude.ts` | `generateArc()` and `generateEpisodeN()` — all Claude API calls |
| `src/lib/prompts/` | System prompts and user message builders for each generation stage |
| `src/lib/tools/` | Anthropic tool definitions (`forge_episode`, `plan_episode_n`, `draft_episode_n`, `extract_episode_n`) |
| `src/lib/bible/apply-delta.ts` | Pure function applying `StateDelta` to produce updated `StoryBibleShape` |
| `src/types/arc.ts` | `GeneratedArc` — Episode 1 output shape |
| `src/types/episode-n.ts` | `EpisodeNOutput`, `EpisodeNPlan`, `StateDelta`, `CriticOutput` |
| `src/types/story-bible.ts` | `StoryBibleShape` — canonical bible type |
| `src/lib/rateLimit.ts` | IP + fingerprint 24-hour rate limiting |
| `src/lib/ownerSession.ts` | Cookie-based arc ownership for public/owner view branching |
| `prisma/schema.prisma` | Single source of truth for all DB models |

### Environment Variables

```
DATABASE_URL          # Pooled connection (Neon)
DIRECT_URL            # Direct connection for migrations
ANTHROPIC_API_KEY
NEXT_PUBLIC_APP_URL   # localhost:3000 dev, arcforge.me prod
RESEND_API_KEY        # Magic link email delivery
AUTH_RESEND_FROM      # From address for magic link emails
BETTER_AUTH_URL       # Better Auth base URL (falls back to NEXT_PUBLIC_APP_URL)
ARC_DAILY_LIMIT       # Override rate limit (default: 1 prod, 10 dev)
```

### Project Structure

- `src/app/` — App Router routes: `/` (landing), `/awakening`, `/arc/[id]`, `/dashboard`, `/login`, `/api/`
- `src/components/` — UI components grouped by feature: `arc/`, `awakening/`, `dashboard/`, `landing/`, `ui/`
- `src/lib/` — Core logic: Claude, Prisma, auth, rate limiting, prompts, tools, bible reducer
- `src/types/` — TypeScript interfaces (`arc.ts`, `episode-n.ts`, `story-bible.ts`)
- `prisma/` — Schema and migrations
- `src/app/generated/prisma/` — Generated Prisma client (do not edit manually)

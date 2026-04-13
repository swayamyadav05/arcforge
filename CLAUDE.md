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

### Core Boundaries
- **Framework**: Next.js 16 App Router with React 19 and TypeScript
- **Styling**: Tailwind CSS 4 with shadcn/ui components
- **Database**: Neon PostgreSQL with Prisma 7 ORM
- **AI Integration**: Anthropic Claude Sonnet 4.5 via `@anthropic-ai/sdk`
- **Authentication**: Better Auth with magic links via Resend
- **Analytics**: PostHog for event tracking
- **Error Tracking**: Sentry configured for edge and server environments
- **OG Image Generation**: `@vercel/og` with `ImageResponse` for Arc Cards

### Key Data Flow
1. User answers 8 awakening questions → stored temporarily
2. Arc generation endpoint (`src/app/api/arc/generate/route.ts`):
   - Applies IP + FingerprintJS rate limiting (1 arc/24hr)
   - Calls Claude with engineered system prompt (`src/lib/claude.ts`)
   - Persists arc data to `arcs` table
   - Logs token usage/cost to `api_usage_logs`
   - Returns arc ID for redirect
3. Arc display (`src/app/arc/[id]/page.tsx`):
   - Checks `?new=true` for owner's animated reveal
   - Without query param: shows public share view
   - OG route (`src/app/api/og/[id]/route.tsx`) generates 1200x630 PNG
4. Real-time animations use Framer Motion (`motion` package)

### Critical Conventions
- **Server Components by Default**: Only add `"use client"` when interaction/state truly requires it
- **No Client Event Handlers in Server Components**: Use CSS hover classes instead of `onMouseEnter`/`onMouseLeave`
- **Stable API Responses**: Validate input early, return specific 4xx errors, never leak internal metadata
- **Arc Generation Safety**: Keep DB writes short, avoid long-lived transactions around Claude API calls
- **OG Compatibility**: ArcCard uses inline styles (not Tailwind) to work in both browser and `@vercel/og` environments
- **Ownership Verification**: Cookie-based sessions in `src/lib/ownerSession.ts`; never rely on query params for authorization

### Important Files & Patterns
- **System Prompt**: `src/lib/claude.ts` - defines arc generation voice and rules (first-person narrative, no generic traits, specific missions)
- **Rate Limiting**: `src/lib/rateLimit.ts` - IP + fingerprint combination
- **Database Schema**: `prisma/schema.prisma` - `arcs`, `rate_limits`, `api_usage_logs` tables
- **Type Safety**: `src/types/arc.ts` - GeneratedArc interface as single source of truth
- **Shared Card Rendering**: Components in `src/components/arc/` must work in both browser and OG contexts
- **Environment Variables**: 
  - `DATABASE_URL` (pooled) + `DIRECT_URL` (for migrations)
  - `ANTHROPIC_API_KEY`
  - `NEXT_PUBLIC_APP_URL` (localhost:3000 dev, arcforge.me prod)

### Project Structure Highlights
- `src/app/` - App Router routes (landing, awakening, quiz, arc/[id], api)
- `src/components/` - Reusable UI components (landing, awakening, arc, ui)
- `src/lib/` - Core logic (Claude integration, Prisma, rate limiting)
- `prisma/` - Database schema and migrations
- `public/` - Static assets (og-home.png for social sharing)

### Common Development Tasks
- **Adding New Quiz Questions**: Modify `src/components/awakening/QuestionCard.tsx` and update quiz flow in `src/components/awakening/QuizFlow.tsx`
- **Updating Arc Display Logic**: Edit `src/app/arc/[id]/page.tsx` for owner vs public view branching
- **Modifying Generation Prompt**: Update `SYSTEM_PROMPT` in `src/lib/claude.ts` (affects all arcs)
- **Changing Styling**: Tailwind classes in components; ArcCard is exception (inline styles for OG compatibility)
- **API Route Changes**: Follow pattern in `src/app/api/` - validate, process, return typed JSON
- **Database Updates**: Edit `prisma/schema.prisma`, run `npx prisma migrate dev`, then `npx prisma generate`
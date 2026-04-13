<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes - APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

# Project Guidelines

## Build and Verify

- Install: `npm install`
- Dev server: `npm run dev`
- Production build: `npm run build`
- Production run: `npm run start`
- Lint: `npm run lint`
- Tests: no test runner is configured yet; do not invent test commands.

## Architecture Boundaries

- Framework: Next.js 16 App Router with React 19 and TypeScript.
- API + DB:
  - Prisma-backed routes must run on Node.js runtime.
  - Arc generation endpoint: `src/app/api/arc/generate/route.ts`.
  - Data models live in `prisma/schema.prisma`.
  - Arc output contract lives in `src/types/arc.ts`.
- Auth + ownership:
  - Better Auth configuration lives in `src/lib/auth.ts`.
  - Owner access is cookie-based and signed in `src/lib/ownerSession.ts`; never rely on query params for authorization.
- OG image generation:
  - Route: `src/app/api/og/[id]/route.tsx`.
  - Keep shared card rendering compatible with both browser UI and OG constraints.
- Core product logic:
  - Arc generation prompt and model behavior: `src/lib/claude.ts`.
  - Rate limiting logic: `src/lib/rateLimit.ts`.

## Conventions and Pitfalls

- Prefer Server Components by default. Add `"use client"` only when interaction/state truly requires it.
- Do not add client-only event handlers (for example `onMouseEnter`/`onMouseLeave`) in Server Components; prefer CSS hover classes where possible.
- Keep API responses stable and product-toned:
  - Validate input early and return specific 4xx responses for known issues.
  - Keep 429 daily-limit semantics intact unless behavior change is explicitly requested.
  - Never leak internal metadata, provider errors, or stack traces in API responses.
- In `src/app/api/arc/generate/route.ts`, keep DB write sections short and avoid long-lived interactive transactions around model calls.
- Keep shared card rendering compatible with OG generation constraints:
  - Favor simple styles compatible with `@vercel/og` and Satori in OG code paths.
  - Keep share-safe data boundaries; do not expose private arc analysis in OG payloads.

## Link, Don't Embed

- Product, narrative, and stack details: `README.md`
- API-route-specific rules: `.github/instructions/api-routes.instructions.md`
- OG/card-specific rules: `.github/instructions/og-card.instructions.md`
- Next.js-specific behavior in this workspace: `node_modules/next/dist/docs/`

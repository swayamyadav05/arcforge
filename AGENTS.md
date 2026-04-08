<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

# Project Guidelines

## Build and Verify

- Install: `npm install`
- Dev server: `npm run dev`
- Production build: `npm run build`
- Lint: `npm run lint`
- Tests: no test runner is configured yet; do not invent test commands.

## Architecture Boundaries

- Framework: Next.js 16 App Router with React 19 and TypeScript.
- API + DB:
  - Prisma-backed routes run in Node.js runtime (for Prisma compatibility).
  - Key endpoint: `src/app/api/arc/generate/route.ts`.
  - Data models live in `prisma/schema.prisma`.
- OG image generation:
  - Route: `src/app/api/og/[id]/route.tsx`.
  - Keep OG rendering constraints in mind when editing card UI used in images.
- Core product logic:
  - Arc generation prompt and model behavior: `src/lib/claude.ts`.
  - Rate limiting logic: `src/lib/rateLimit.ts`.

## Conventions and Pitfalls

- Prefer Server Components by default. Add `"use client"` only when interaction/state requires it.
- Do not add client-only event handlers (for example `onMouseEnter`/`onMouseLeave`) in Server Components; prefer CSS hover classes where possible.
- Keep shared card rendering compatible with both browser UI and OG image generation constraints.
- Preserve rate-limit semantics unless explicitly changing product behavior:
  - 24-hour window logic in `src/lib/rateLimit.ts`.
  - Matching currently uses IP or fingerprint.
- Keep API error responses user-friendly and product-toned, not generic/internal.

## Link, Don't Embed

- Product, narrative, and stack details: `README.md`
- Next.js-specific behavior in this workspace: `node_modules/next/dist/docs/`

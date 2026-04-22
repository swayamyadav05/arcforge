---
description: "Use when editing OG image generation or Arc card rendering. Covers @vercel/og constraints, inline-style compatibility, and safe public-share data boundaries."
name: "OG Card Guidelines"
applyTo: "src/app/api/og/**, src/components/arc/ArcCard.tsx"
---

# OG Card Guidelines

- Keep OG output deterministic and crawler-friendly:
  - Keep the share image at 1200x630.
  - Do not introduce client-only interactivity in OG rendering.
- Design OG JSX for @vercel/og and Satori constraints:
  - Prefer straightforward inline style objects.
  - Do not rely on external stylesheets, complex selectors, or browser-only APIs.
- Keep card visuals compatible across browser rendering and OG image generation.
- Guard against overflow in share previews:
  - Truncate or constrain long text fields.
  - Keep type scale and spacing readable at preview size.
- Load fonts explicitly in the OG route and keep fallback families.
- Keep OG data public-safe:
  - Include arc identity and presentation fields only.
  - Never expose private metadata or raw answers.
- Preserve current route and data-flow unless explicitly requested:
  - src/app/api/og/[id]/route.tsx fetches arc data from the API route.
  - src/components/arc/ArcCard.tsx should stay compatible with OG constraints.

See AGENTS.md for global repo rules.

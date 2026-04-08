---
description: "Use when editing Next.js App Router API route handlers in src/app/api. Covers runtime selection, validation, product-toned errors, and ArcForge rate-limit behavior."
name: "API Route Guidelines"
applyTo:
  - "src/app/api/**/route.ts"
  - "src/app/api/**/route.tsx"
---

# API Route Guidelines

- Keep Prisma-backed routes on Node.js runtime.
- Validate request input early and return specific 4xx responses.
- Keep response payloads stable. If adding fields, preserve existing response keys used by clients.
- Use product-toned user-facing messages for known error branches. Avoid generic language when the cause is known.
- For rate-limit cases in arc generation, return HTTP 429 with a clear daily-limit message.
- For unexpected failures, log internal details server-side and return a safe user-facing message.
- Do not leak internal metadata (for example IP, fingerprint, provider errors, stack traces) in responses.
- Preserve current rate-limit semantics unless the task explicitly changes product behavior:
  - 24-hour rolling window logic.
  - Match by IP or fingerprint.
- In src/app/api/arc/generate/route.ts, keep DB write sections short and avoid long-lived interactive transactions around model calls.

See AGENTS.md for global repo rules and README.md for product narrative context.

// src/lib/posthog.ts
import { PostHog } from "posthog-node";

// Server-side PostHog client — used in API routes.
// Different from the browser client in layout.tsx which
// tracks client-side events automatically.
// We use a singleton pattern to avoid creating a new client
// on every API call.
const posthog = new PostHog(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
  host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
  flushAt: 1,
  flushInterval: 0,
  disabled: process.env.NODE_ENV === "development",
});

export default posthog;

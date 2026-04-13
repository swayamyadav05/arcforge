// src/lib/auth-client.ts
// The Better Auth client is used in client components for
// sign-in, sign-out, and reading session state in the browser.
import { createAuthClient } from "better-auth/react";
import { magicLinkClient } from "better-auth/client/plugins";

function resolveAuthBaseURL() {
  // Use the current browser origin in production to avoid cross-origin
  // redirects (for example apex <-> www) that surface as CORS errors.
  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin;
  }

  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

export const authClient = createAuthClient({
  baseURL: resolveAuthBaseURL(),
  plugins: [magicLinkClient()],
});

// Export individual methods for convenience
export const { signIn, signOut, useSession } = authClient;

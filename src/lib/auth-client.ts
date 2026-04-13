// src/lib/auth-client.ts
// The Better Auth client is used in client components for
// sign-in, sign-out, and reading session state in the browser.
import { createAuthClient } from "better-auth/react";
import { magicLinkClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL ?? "https://arcforge.me",
  plugins: [magicLinkClient()],
});

// Export individual methods for convenience
export const { signIn, signOut, useSession } = authClient;

// src/lib/auth.ts
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { magicLink } from "better-auth/plugins";
import prisma from "@/lib/prisma";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const auth = betterAuth({
  trustedOrigins: [
    process.env.BETTER_AUTH_URL || "http://localhost:3000",
    ...(process.env.VERCEL_URL
      ? [`https://${process.env.VERCEL_URL}`]
      : []),
  ],
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  // Magic link plugin — this is the email-based passwordless auth
  // that sends a one-click sign-in link to the user's inbox.
  // Perfect for ArcForge's audience who don't want to manage passwords.
  plugins: [
    magicLink({
      sendMagicLink: async ({ email, url }) => {
        await resend.emails.send({
          from: process.env.AUTH_RESEND_FROM!,
          to: email,
          subject: "Your ArcForge sign-in link",
          html: `
            <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 24px; background: #0a0612; color: #EEEDFE;">
              <h1 style="font-size: 24px; font-weight: 700; margin-bottom: 8px; color: #EEEDFE;">
                Your arc is waiting.
              </h1>
              <p style="color: #AFA9EC; margin-bottom: 32px; line-height: 1.6;">
                Click the link below to sign in to ArcForge. This link expires in 10 minutes and can only be used once.
              </p>
              <a href="${url}" style="display: inline-block; background: #534AB7; color: #EEEDFE; padding: 14px 32px; border-radius: 10px; text-decoration: none; font-weight: 500; font-size: 15px;">
                Enter ArcForge
              </a>
              <p style="color: #7F77DD; font-size: 12px; margin-top: 32px;">
                If you didn't request this, you can safely ignore this email.
              </p>
            </div>
          `,
        });
      },
    }),
  ],

  // Session configuration — 30 day sessions so users don't get
  // logged out constantly. Magic link auth means re-authenticating
  // is low friction anyway.
  session: {
    expiresIn: 60 * 60 * 24 * 30, // 30 days in seconds
    updateAge: 60 * 60 * 24, // refresh session if older than 1 day
  },

  // The base URL must match your deployment environment.
  // Better Auth uses this to construct callback URLs in emails.
  baseURL: process.env.NEXT_PUBLIC_APP_URL ?? "https://arcforge.me",
});

// Export the type for use in client-side auth client creation
export type Auth = typeof auth;

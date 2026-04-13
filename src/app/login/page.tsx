// src/app/login/page.tsx
"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await authClient.signIn.magicLink({
      email,
      callbackURL: "/dashboard",
    });
    setSent(true);
    setLoading(false);
  }

  if (sent) {
    return (
      <div className="min-h-screen bg-forge-bg-deepest flex items-center justify-center px-6">
        <div className="max-w-md w-full text-center">
          <p className="text-xs uppercase tracking-[0.15em] text-purple-400 mb-4">
            Check your inbox
          </p>
          <h1 className="text-3xl font-bold text-[#EEEDFE] font-heading mb-4">
            Your link is on the way.
          </h1>
          <p className="text-[#AFA9EC] leading-relaxed">
            We sent a sign-in link to{" "}
            <strong className="text-[#EEEDFE]">{email}</strong>. Click
            it to enter ArcForge. It expires in 10 minutes.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-forge-bg-deepest flex items-center justify-center px-6">
      <div className="max-w-md w-full">
        <p className="text-xs uppercase tracking-[0.15em] text-purple-400 mb-4 text-center">
          Continue your arc
        </p>
        <h1 className="text-3xl font-bold text-[#EEEDFE] font-heading mb-2 text-center">
          Sign in to ArcForge
        </h1>
        <p className="text-[#AFA9EC] text-center mb-8 text-sm">
          No password needed. We&apos;ll send a link to your inbox.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
            className="w-full px-4 py-3 rounded-xl text-[#EEEDFE] placeholder:text-purple-400/40 focus:outline-none focus:border-purple-500/40"
            style={{
              background: "rgba(83, 74, 183, 0.08)",
              border: "1px solid rgba(83, 74, 183, 0.2)",
            }}
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-medium text-[#EEEDFE] bg-linear-to-r from-[#534AB7] to-[#6B5FD8] hover:opacity-90 transition-opacity disabled:opacity-50">
            {loading ? "Sending..." : "Send sign-in link"}
          </button>
        </form>
      </div>
    </div>
  );
}

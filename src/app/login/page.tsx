"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import type { FormEvent } from "react";
import { ArrowRight, Mail, Sparkles } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

const PARTICLE_POSITIONS = Array.from({ length: 20 }, (_, i) => ({
  left: `${(i * 37 + 13) % 100}%`,
  top: `${(i * 53 + 7) % 100}%`,
  duration: `${5 + (i % 10)}s`,
  delay: `${i % 5}s`,
}));

function ParticleField() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {PARTICLE_POSITIONS.map((particle, i) => (
        <div
          key={i}
          className="absolute h-1 w-1 rounded-full bg-purple-400/20"
          style={{
            left: particle.left,
            top: particle.top,
            animation: `float ${particle.duration} ease-in-out infinite`,
            animationDelay: particle.delay,
          }}
        />
      ))}
    </div>
  );
}

function Atmosphere({ sent }: { sent: boolean }) {
  return (
    <>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(38,33,92,0.2),transparent_65%)] opacity-40" />

      <div
        className={`absolute rounded-full blur-3xl ${
          sent
            ? "top-1/4 left-1/4 h-96 w-96 bg-purple-500/5 animate-pulse"
            : "top-1/3 left-1/3 h-150 w-150 bg-purple-500/10"
        }`}
      />

      <div
        className={`absolute rounded-full blur-3xl ${
          sent
            ? "right-1/4 bottom-1/4 h-96 w-96 bg-purple-400/5 animate-pulse [animation-delay:1000ms]"
            : "right-1/3 bottom-1/3 h-100 w-100 bg-purple-400/5"
        }`}
      />

      {!sent ? (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-full w-px bg-linear-to-b from-transparent via-purple-500/10 to-transparent" />
        </div>
      ) : null}

      <ParticleField />
    </>
  );
}

function LoginPageContent() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const searchParams = useSearchParams();

  const callbackURL = searchParams.get("callbackURL") ?? "/dashboard";

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setSendError(null);

    const { error } = await authClient.signIn.magicLink({
      email,
      callbackURL,
    });

    if (error) {
      setSendError(
        error.message ?? "Something went wrong. Please try again.",
      );
      setLoading(false);
      return;
    }

    setSent(true);
    setLoading(false);
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-forge-bg-deepest px-6 text-white">
      <Atmosphere sent={sent} />

      {sent ? (
        <div className="relative z-10 mx-auto w-full max-w-2xl text-center">
          <div className="mb-8 flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-purple-500/30 blur-2xl animate-pulse" />
              <Mail className="animate-float-soft relative h-16 w-16 text-purple-400" />
            </div>
          </div>

          <h1
            className="mb-6 bg-linear-to-b from-white to-purple-200 bg-clip-text text-5xl leading-tight font-bold text-transparent lg:text-6xl"
            style={{ fontFamily: "var(--font-heading)" }}>
            The link has been sent.
          </h1>

          <div className="mb-12 space-y-6">
            <p className="text-xl leading-relaxed text-[#AFA9EC]">
              Check your inbox at{" "}
              <span className="break-all font-medium text-purple-300">
                {email}
              </span>
            </p>
            <p className="mx-auto max-w-md leading-relaxed text-[#AFA9EC]/70">
              Click the magic link to begin. The door only stays open
              for 15 minutes.
            </p>
          </div>

          <div className="mb-12 flex items-center justify-center space-x-4">
            <div className="h-px w-24 bg-linear-to-r from-transparent to-purple-500/30" />
            <Sparkles className="h-4 w-4 text-purple-400/50" />
            <div className="h-px w-24 bg-linear-to-l from-transparent to-purple-500/30" />
          </div>

          <button
            type="button"
            onClick={() => setSent(false)}
            className="text-sm text-purple-400/60 transition-colors duration-300 hover:text-purple-300">
            Wrong email? Try again
          </button>
        </div>
      ) : (
        <div className="relative z-10 mx-auto w-full max-w-xl">
          <div className="mb-16 flex items-center justify-center">
            <Link href="/" className="no-underline">
              <span className="font-heading font-extrabold tracking-tighter uppercase text-[22px] text-[#EEEDFE]">
                ArcForge
              </span>
            </Link>
          </div>

          <div className="mb-12 text-center">
            <h1
              className="mb-8 text-5xl leading-[1.1] font-bold lg:text-7xl"
              style={{ fontFamily: "var(--font-heading)" }}>
              <span className="block">Every story</span>
              <span className="block bg-linear-to-r from-purple-400 via-purple-200 to-purple-400 bg-clip-text text-transparent">
                starts with
              </span>
              <span className="block">a choice.</span>
            </h1>

            <p className="mx-auto mb-2 max-w-md text-xl leading-relaxed text-[#AFA9EC]">
              This is the threshold.
            </p>
            <p className="mx-auto max-w-md leading-relaxed text-[#AFA9EC]/60">
              Once you step through, your arc begins.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="group relative">
              <div className="absolute -inset-1 rounded-lg bg-linear-to-r from-purple-600 to-purple-400 opacity-0 blur transition duration-500 group-focus-within:opacity-20" />
              <div className="relative">
                <label htmlFor="email" className="sr-only">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="your.email@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-purple-500/30 bg-forge-bg-deepest/80 px-5 py-5 text-base text-white placeholder:text-purple-400/30 backdrop-blur-xl transition-all duration-300 focus:border-purple-400/60 focus:ring-1 focus:ring-purple-500/20 focus:outline-none"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading || !email.trim()}
              className="group w-full h-auto! rounded-lg bg-linear-to-r from-forge-purple-900 to-forge-lavender-600 py-5! text-base text-forge-white shadow-lg shadow-purple-500/30 transition-all duration-300 hover:from-forge-purple-900 hover:to-forge-purple-700 hover:shadow-purple-500/50 disabled:cursor-not-allowed disabled:opacity-50">
              {loading ? (
                <span className="flex items-center justify-center space-x-2">
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  <span>Opening the door...</span>
                </span>
              ) : (
                <span className="flex items-center justify-center space-x-2">
                  <span>Send me the magic link</span>
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </span>
              )}
            </Button>
          </form>

          {sendError && (
            <p className="mt-4 text-center text-sm text-red-400/80">
              {sendError}
            </p>
          )}

          <div className="mt-12 text-center">
            <p className="text-xs tracking-wide text-purple-400/40">
              No password. No signup flow. Just you and the story.
            </p>
          </div>

          <div className="mt-16 text-center">
            <Link
              href="/"
              className="underline-offset-4 text-sm text-purple-400/60 transition-colors duration-300 hover:text-purple-300 hover:underline">
              ← Not ready yet? Go back
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={<div className="min-h-screen bg-forge-bg-deepest" />}>
      <LoginPageContent />
    </Suspense>
  );
}

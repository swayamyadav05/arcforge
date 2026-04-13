"use client";

import { getOrCreateFingerprint } from "@/lib/fingerprint";
import { GeneratedArc } from "@/types/arc";
import { useEffect, useRef, useState } from "react";
import QuestionCard from "./QuestionCard";
import { useRouter } from "next/navigation";
import { usePostHog } from "posthog-js/react";

// These are the three phases the quiz can be in at any moment.
// Modelling them as a union type rather than multiple booleans
// makes it impossible to accidentally be in two phases at once —
// you can't be both "questioning" and "loading" simultaneously,
// which is a real bug that multiple boolean flags can produce.
type QuizePhase =
  | "questioning"
  | "loading"
  | "revealing"
  | "rateLimited";

type GenerateArcResponse = {
  arc?: GeneratedArc;
  arcId?: string;
  error?: string;
  code?: string;
  latestArcId?: string | null;
};

type ArcStatusResponse = {
  canForge?: boolean;
  error?: string;
  code?: string;
  latestArcId?: string | null;
};

const QUESTIONS = [
  {
    id: "q1",
    text: "What's the thing you're best at that you've never once felt proud of?",
    hint: "The skill that lives in your hands but not in your heart.",
  },
  {
    id: "q2",
    text: "Describe the moment that changed you — even if nobody knows it did.",
    hint: "Before and after. Everything split there.",
  },
  {
    id: "q3",
    text: "Who in your life do you secretly measure yourself against?",
    hint: "Not who you admire. Who you watch.",
  },
  {
    id: "q4",
    text: "What do people consistently get wrong about you?",
    hint: "The misread that follows you everywhere.",
  },
  {
    id: "q5",
    text: "Your power exists — but it has a cost. What would you sacrifice to fully claim it?",
    hint: "Every ability has a price. What's yours?",
  },
  {
    id: "q6",
    text: "What do you keep starting but never finishing?",
    hint: "The 80% that never becomes 100%.",
  },
  {
    id: "q7",
    text: "Are you someone who burns bright and fast, or someone who survives everything?",
    hint: "Neither is better. Both are real.",
  },
  {
    id: "q8",
    text: "What does your final form look like — and what's standing between you and it right now?",
    hint: "The version of you that needs no explanation.",
  },
];

const QuizFlow = () => {
  const [phase, setPhase] = useState<QuizePhase>("questioning");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [arc, setArc] = useState<GeneratedArc | null>(null);
  const [arcId, setArcId] = useState<string | null>(null);
  const [latestArcId, setLatestArcId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [rateLimitMessage, setRateLimitMessage] = useState<
    string | null
  >(null);
  const [showErrorToast, setShowErrorToast] = useState(false);
  const [isStatusChecking, setIsStatusChecking] = useState(true);
  const toastTimeoutRef = useRef<number | null>(null);
  const router = useRouter();
  const posthog = usePostHog();

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current !== null) {
        window.clearTimeout(toastTimeoutRef.current);
      }
    };
  }, []);

  const triggerErrorToast = (message: string) => {
    setError(message);
    setShowErrorToast(true);

    if (toastTimeoutRef.current !== null) {
      window.clearTimeout(toastTimeoutRef.current);
    }

    toastTimeoutRef.current = window.setTimeout(() => {
      setShowErrorToast(false);
    }, 3200);
  };

  useEffect(() => {
    let isCancelled = false;

    const checkForgeStatus = async () => {
      try {
        const localArcId = localStorage.getItem(
          "arcforge_latest_arc_id",
        );

        if (localArcId && !isCancelled) {
          setLatestArcId(localArcId);
        }

        const fingerprint = await getOrCreateFingerprint();

        const response = await fetch("/api/arc/status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fingerprint }),
        });

        if (!response.ok) {
          return;
        }

        const data = (await response.json()) as ArcStatusResponse;

        if (isCancelled) {
          return;
        }

        if (data.latestArcId) {
          setLatestArcId(data.latestArcId);
          localStorage.setItem(
            "arcforge_latest_arc_id",
            data.latestArcId,
          );
        }

        if (data.canForge === false) {
          setRateLimitMessage(
            data.error ?? "Arc creation is limited to once per day.",
          );
          triggerErrorToast("You forged your Arc today.");
          setPhase("rateLimited");
        }
      } catch {
        // If status pre-check fails we avoid blocking the user and
        // continue with the normal forge flow.
      } finally {
        if (!isCancelled) {
          setIsStatusChecking(false);
        }
      }
    };

    checkForgeStatus();

    return () => {
      isCancelled = true;
    };
  }, []);

  // This is the dramatic loading messages array — each message
  // appears for about 3 seconds while Claude is thinking.
  // The messages themselves are part of the product experience.
  const LOADING_MESSAGES = [
    "Something in your answers is louder than the rest...",
    "The wound is clearer than you made it sound...",
    "Finding the name for what you already know...",
    "The weapon was always there. It just needed the light...",
    "Your rival is closer than you admitted...",
    "This arc has been in motion longer than today...",
    "The pattern is becoming visible...",
    "Almost. The hardest part to say is coming last...",
  ];

  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);

  const handleAnswer = async (answer: string) => {
    const question = QUESTIONS[currentIndex];
    const newAnswers = { ...answers, [question.id]: answer };
    setAnswers(newAnswers);

    if (currentIndex === 0) {
      posthog.capture("quiz_started");
    }

    if (currentIndex < QUESTIONS.length - 1) {
      setCurrentIndex(currentIndex + 1);
      return;
    }

    // Last question answered — transition to loading phase
    // and call the generate endpoint.
    setPhase("loading");

    // Start cycling through loading messages every 3 seconds.
    // We store the interval ID so we can clear it when the
    // API call completes — otherwise it keeps cycling forever.
    const messageInterval = window.setInterval(() => {
      setLoadingMessageIndex((prev) =>
        prev < LOADING_MESSAGES.length - 1 ? prev + 1 : prev,
      );
    }, 3000);

    try {
      const fingerprint = await getOrCreateFingerprint();

      const response = await fetch("/api/arc/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers: newAnswers,
          fingerprint,
        }),
      });

      const data = (await response.json()) as GenerateArcResponse;

      if (!response.ok) {
        const apiErrorMessage =
          data.error ??
          "Something went wrong while forging your Arc.";

        const isDailyLimitError =
          response.status === 429 ||
          data.code === "DAILY_LIMIT_REACHED";

        if (isDailyLimitError) {
          if (data.latestArcId) {
            setLatestArcId(data.latestArcId);
            localStorage.setItem(
              "arcforge_latest_arc_id",
              data.latestArcId,
            );
          }

          setRateLimitMessage(apiErrorMessage);
          triggerErrorToast("You forged your Arc today.");
          setPhase("rateLimited");
          return;
        }

        triggerErrorToast(apiErrorMessage);
        setPhase("questioning");
        return;
      }

      if (!data.arc || !data.arcId) {
        throw new Error("Arc response was incomplete.");
      }

      localStorage.setItem("arcforge_latest_arc_id", data.arcId);
      setLatestArcId(data.arcId);

      setArc(data.arc);
      setArcId(data.arcId);
      router.push("/dashboard");
    } catch (err) {
      const fallbackMessage =
        err instanceof Error
          ? err.message
          : "Something went wrong while forging your Arc.";

      triggerErrorToast(fallbackMessage);
      // We go back to questioning phase on error so the user
      // isn't stuck on a loading screen with no way forward.
      setPhase("questioning");
    } finally {
      window.clearInterval(messageInterval);
    }
  };

  // Phase rendering — each phase returns completely different UI.
  // This is cleaner than a single JSX tree with many conditionals
  // because each phase's UI is visually isolated and easy to reason about.

  if (isStatusChecking && phase === "questioning") {
    return (
      <div className="min-h-[90vh] bg-forge-bg-deepest flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-xl rounded-2xl border border-[#6E5FE0]/25 bg-[#120d25] p-8 text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-[#9B8FF1] mb-4">
            Awakening Gate
          </p>
          <p className="text-base text-[#CBC5F7]">
            Checking your forge status...
          </p>
        </div>
      </div>
    );
  }

  if (phase === "loading") {
    return (
      <div className="min-h-[90vh] bg-black flex flex-col items-center justify-center px-24">
        <div className="flex flex-col items-center gap-8">
          {/* <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-purple-500 mx-auto" /> */}
          <div className="w-32 h-32 relative flex items-center justify-center">
            <div className="absolute inset-0 rounded-xl bg-blue-500/20 blur-xl animate-pulse"></div>

            <div className="w-full h-full relative flex items-center justify-center">
              <div className="absolute inset-0 rounded-xl bg-linear-to-r from-cyan-500 via-blue-500 to-purple-500 animate-spin blur-sm"></div>

              <div className="absolute inset-1 bg-gray-900 rounded-lg flex items-center justify-center overflow-hidden">
                <div className="flex gap-1 items-center">
                  <div className="w-1.5 h-12 bg-cyan-500 rounded-full animate-[bounce_1s_ease-in-out_infinite]"></div>
                  <div className="w-1.5 h-12 bg-blue-500 rounded-full animate-[bounce_1s_ease-in-out_infinite_0.1s]"></div>
                  <div className="w-1.5 h-12 bg-indigo-500 rounded-full animate-[bounce_1s_ease-in-out_infinite_0.2s]"></div>
                  <div className="w-1.5 h-12 bg-purple-500 rounded-full animate-[bounce_1s_ease-in-out_infinite_0.3s]"></div>
                </div>

                <div className="absolute inset-0 bg-linear-to-t from-transparent via-blue-500/10 to-transparent animate-pulse"></div>
              </div>
            </div>

            <div className="absolute -top-1 -left-1 w-2 h-2 bg-blue-500 rounded-full animate-ping"></div>
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-purple-500 rounded-full animate-ping delay-100"></div>
            <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-cyan-500 rounded-full animate-ping delay-200"></div>
            <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-blue-500 rounded-full animate-ping delay-300"></div>
          </div>

          <p className="text-purple-300 text-lg tracking-wide text-center transition-all duration-500">
            {LOADING_MESSAGES[loadingMessageIndex]}
          </p>
          <p className="text-gray-600 text-sm">
            Your arc is being forged. This takes a moment.
          </p>
        </div>
      </div>
    );
  }

  if (phase === "revealing" && arc && arcId) {
    // Import ArcReveal here — we'll build that component next.
    // For now a placeholder so the phase transition works.
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center px-4">
        <p className="text-white text-2xl">
          Arc ready — reveal component coming next
        </p>
      </div>
    );
  }

  if (phase === "rateLimited") {
    return (
      <div className="min-h-[90vh] bg-forge-bg-deepest flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-2xl rounded-2xl border border-[#6E5FE0]/35 bg-[#120d25] p-8 md:p-10 shadow-[0_0_80px_-30px_rgba(111,94,224,0.75)]">
          <p className="text-xs uppercase tracking-[0.2em] text-[#9B8FF1] mb-4">
            Episode 01 Complete
          </p>

          <h2 className="text-3xl md:text-4xl font-semibold text-[#EEEDFE] leading-tight mb-4">
            You forged your Arc today.
          </h2>

          <p className="text-base md:text-lg text-[#CBC5F7] leading-relaxed mb-3">
            {rateLimitMessage ??
              "Arc creation is limited to once per day."}
          </p>

          <p className="text-sm md:text-base text-[#AFA9EC] leading-relaxed mb-8">
            Phase 2 coming soon with more features...
          </p>

          <div className="flex flex-wrap gap-3">
            {latestArcId && (
              <button
                type="button"
                onClick={() => router.push(`/arc/${latestArcId}`)}
                className="px-5 py-2.5 rounded-lg bg-[#6E5FE0] text-[#EEEDFE] hover:bg-[#7F73E8] transition-colors cursor-pointer">
                Open Today&apos;s Arc
              </button>
            )}

            <button
              type="button"
              onClick={() => router.push("/")}
              className="px-5 py-2.5 rounded-lg border border-[#6E5FE0]/50 text-[#CBC5F7] hover:border-[#7F73E8] hover:text-[#EEEDFE] transition-colors cursor-pointer">
              Back to Home
            </button>
          </div>

          {!latestArcId && (
            <p className="text-xs text-[#8E87C8] mt-5">
              Your previous arc link is not available on this device
              yet.
            </p>
          )}
        </div>
      </div>
    );
  }

  // Default — questioning phase
  // In the questioning phase return in QuizFlow.tsx
  return (
    <div className="flex flex-col flex-1 bg-forge-bg-deepest">
      {/* Error toast — only renders when there's an error message */}
      {showErrorToast && error && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-red-900/90 text-[#EEEDFE] px-6 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="w-full h-1 bg-purple-950 mt-0.5">
        <div
          className="h-full bg-linear-to-r from-[#534AB7] to-[#7F73E8] transition-all duration-500"
          style={{
            width: `${((currentIndex + 1) / QUESTIONS.length) * 100}%`,
          }}
        />
      </div>

      <QuestionCard
        key={currentIndex}
        question={QUESTIONS[currentIndex]}
        questionNumber={currentIndex + 1}
        totalQuestions={QUESTIONS.length}
        onAnswer={handleAnswer}
      />
    </div>
  );
};

export default QuizFlow;

"use client";

import { GeneratedArc } from "@/types/arc";
import { useState } from "react";
import QuestionCard from "./QuestionCard";
import { useRouter } from "next/navigation";

// These are the three phases the quiz can be in at any moment.
// Modelling them as a union type rather than multiple booleans
// makes it impossible to accidentally be in two phases at once —
// you can't be both "questioning" and "loading" simultaneously,
// which is a real bug that multiple boolean flags can produce.
type QuizePhase = "questioning" | "loading" | "revealing";

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
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // This is the dramatic loading messages array — each message
  // appears for about 3 seconds while Claude is thinking.
  // The messages themselves are part of the product experience.
  const LOADING_MESSAGES = [
    "Reading between your lines...",
    "Locating your wound...",
    "Forging your weapon...",
    "Naming your rival...",
    "Your arc is taking shape...",
    "Almost. This one runs deep...",
  ];

  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);

  const handleAnswer = async (answer: string) => {
    const question = QUESTIONS[currentIndex];
    const newAnswers = { ...answers, [question.id]: answer };
    setAnswers(newAnswers);

    if (currentIndex < QUESTIONS.length - 1) {
      // Not the last question — advance to the next one.
      // We increment the index which causes QuizFlow to
      // re-render with the next question's data.
      setCurrentIndex(currentIndex + 1);
      return;
    }

    // Last question answered — transition to loading phase
    // and call the generate endpoint.
    setPhase("loading");

    // Start cycling through loading messages every 3 seconds.
    // We store the interval ID so we can clear it when the
    // API call completes — otherwise it keeps cycling forever.
    const messageInterval = setInterval(() => {
      setLoadingMessageIndex((prev) =>
        prev < LOADING_MESSAGES.length - 1 ? prev + 1 : prev,
      );
    }, 3000);

    try {
      // Get the fingerprint from localStorage where
      // FingerprintJS stored it on page load.
      const fingerprint = localStorage.getItem(
        "arcforge_fingerprint",
      );

      const response = await fetch("/api/arc/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers: newAnswers,
          fingerprint,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Something went wrong.");
      }

      clearInterval(messageInterval);
      setArc(data.arc);
      setArcId(data.arcId);
      router.push(`/arc/${data.arcId}?new=true`);
    } catch (err) {
      clearInterval(messageInterval);
      setError(
        err instanceof Error ? err.message : "Something went wrong.",
      );
      // We go back to questioning phase on error so the user
      // isn't stuck on a loading screen with no way forward.
      setPhase("questioning");
    }
  };

  // Phase rendering — each phase returns completely different UI.
  // This is cleaner than a single JSX tree with many conditionals
  // because each phase's UI is visually isolated and easy to reason about.

  if (phase === "loading") {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center px-24">
        <div className="flex flex-col items-center gap-8">
          {/* Animated pulsing orb - gives the loading screen a sense of something alive happening, not just a spinner */}
          <div className="w-16 h-16 rounded-full bg-purple-600 animated-pulse" />
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

  // Default — questioning phase
  // In the questioning phase return in QuizFlow.tsx
  return (
    <div className="flex flex-col flex-1 bg-forge-bg-deepest">
      {/* Error toast — only renders when there's an error message */}
      {error && (
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

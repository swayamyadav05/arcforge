// src/components/awakening/QuestionCard.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight } from "lucide-react";
import { Button } from "../ui/button";

interface Question {
  id: string;
  text: string;
  hint: string;
}

interface QuestionCardProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  onAnswer: (answer: string) => void;
}

export default function QuestionCard({
  question,
  questionNumber,
  totalQuestions,
  onAnswer,
}: QuestionCardProps) {
  const MIN_ANSWER_CHARACTERS = 50;
  const [value, setValue] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 50);
    textareaRef.current?.focus();
    return () => clearTimeout(timer);
  }, []);

  const isLastQuestion = questionNumber === totalQuestions;
  const answerLength = value.trim().length;
  const hasMinimumCharacters = answerLength >= MIN_ANSWER_CHARACTERS;
  const textareaId = `question-answer-${question.id}`;

  function handleNext() {
    if (!hasMinimumCharacters) return;
    setIsVisible(false);
    setTimeout(() => onAnswer(value.trim()), 300);
  }

  function handleKeyDown(
    e: React.KeyboardEvent<HTMLTextAreaElement>,
  ) {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      handleNext();
    }
  }

  // In QuestionCard.tsx — the return becomes this structure
  return (
    <div className="flex-1 flex items-center justify-center px-6 py-24">
      <div
        className={`max-w-2xl w-full transition-opacity duration-300 ${isVisible ? "opacity-100" : "opacity-0"}`}>
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium tracking-wide text-purple-400 mb-4">
              EPISODE 01 · THE AWAKENING
            </p>

            <div className="text-sm text-purple-300">
              Question {questionNumber} of {totalQuestions}
            </div>
          </div>

          <h2
            className="text-4xl lg:text-5xl font-bold mb-4 leading-none"
            style={{ fontFamily: "Outfit, sans-serif" }}>
            {question.text}
          </h2>

          <p className="text-purple-300/70 italic text-lg">
            {question.hint}
          </p>
        </div>

        <div className="space-y-6">
          <label htmlFor={textareaId} className="sr-only">
            Your answer for: {question.text}
          </label>
          <Textarea
            id={textareaId}
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Your answer..."
            autoFocus
            className="min-h-50 bg-purple-950/20 border-purple-500/20 text-white placeholder:text-purple-400/30 text-lg resize-none focus:border-purple-500/40 focus:ring-purple-500/20"
          />

          <div className="flex justify-between items-center">
            <span className="text-sm text-purple-400/60">
              {hasMinimumCharacters
                ? `${answerLength} characters`
                : "Keep going - the more specific you are, the more your arc will reveal"}
            </span>

            <Button
              onClick={handleNext}
              disabled={!hasMinimumCharacters}
              className="bg-linear-to-r from-[#534AB7] to-[#6B5FD8] hover:from-[#6B5FD8] hover:to-[#7F73E8] text-white px-8 py-6 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed">
              {isLastQuestion ? "Forge my arc" : "Next"}
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

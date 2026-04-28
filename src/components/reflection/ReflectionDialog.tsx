"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { DialogRoot, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// ── Types ────────────────────────────────────────────────────────────────────

interface ReflectionDialogProps {
  seriesId: string;
  characterName: string;
  episodeNumber: number; // the episode being generated (currentEpisode + 1)
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGenerated: (newArcId: string) => void;
}

type SaveStatus = "idle" | "saving" | "saved";
type Phase = "loading" | "ready" | "confirming" | "generating" | "error";

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatRelativeTime(date: Date): string {
  const diffMs = Date.now() - date.getTime();
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 1) return "just now";
  if (minutes === 1) return "1 minute ago";
  if (minutes < 60) return `${minutes} minutes ago`;
  const hours = Math.floor(minutes / 60);
  return hours === 1 ? "1 hour ago" : `${hours} hours ago`;
}

// ── Component ────────────────────────────────────────────────────────────────

export default function ReflectionDialog({
  seriesId,
  characterName,
  episodeNumber,
  open,
  onOpenChange,
  onGenerated,
}: ReflectionDialogProps) {
  const [phase, setPhase] = useState<Phase>("loading");
  const [q1, setQ1] = useState("");
  const [q2, setQ2] = useState("");
  const [canGenerate, setCanGenerate] = useState(false);
  const [daysRemaining, setDaysRemaining] = useState(0);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [lastSavedDisplay, setLastSavedDisplay] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [generatingStage, setGeneratingStage] = useState(0);

  // Tracks whether initial draft population is still in progress.
  // Prevents the first setValue call from triggering auto-save.
  const isInitializingRef = useRef(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Staged generating messages ────────────────────────────────────────────

  const GENERATING_LABELS = [
    "Planning the episode…",
    "Writing…",
    "Finalizing…",
  ];

  useEffect(() => {
    if (phase !== "generating") {
      setGeneratingStage(0);
      return;
    }
    const t1 = setTimeout(() => setGeneratingStage(1), 10_000);
    const t2 = setTimeout(() => setGeneratingStage(2), 25_000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [phase]);

  // ── Relative time display ─────────────────────────────────────────────────

  useEffect(() => {
    if (!lastSavedAt) return;
    setLastSavedDisplay(formatRelativeTime(lastSavedAt));
    const interval = setInterval(() => {
      setLastSavedDisplay(formatRelativeTime(lastSavedAt));
    }, 30_000);
    return () => clearInterval(interval);
  }, [lastSavedAt]);

  // ── Load draft on open ────────────────────────────────────────────────────

  useEffect(() => {
    if (!open) {
      // Reset everything when the dialog closes so the next open starts fresh.
      setPhase("loading");
      setQ1("");
      setQ2("");
      setCanGenerate(false);
      setSaveStatus("idle");
      setLastSavedAt(null);
      setErrorMessage("");
      if (debounceRef.current) clearTimeout(debounceRef.current);
      return;
    }

    isInitializingRef.current = true;
    setPhase("loading");

    fetch(`/api/arc/series/${seriesId}/reflection`)
      .then((r) => r.json())
      .then((data) => {
        setCanGenerate(data.canGenerate ?? false);
        setDaysRemaining(Math.max(0, 7 - (data.daysSincePrev ?? 0)));

        if (data.reflection) {
          setQ1(data.reflection.q1 ?? "");
          setQ2(data.reflection.q2 ?? "");
          const savedAt = new Date(data.reflection.updatedAt);
          setLastSavedAt(savedAt);
          setLastSavedDisplay(formatRelativeTime(savedAt));
          setSaveStatus("saved");
        }

        setPhase("ready");
      })
      .catch(() => setPhase("ready")) // fail open — let them type
      .finally(() => {
        // Small delay so the field onChange handlers that fire during
        // population don't enqueue an immediate auto-save.
        setTimeout(() => {
          isInitializingRef.current = false;
        }, 150);
      });
  }, [open, seriesId]);

  // ── Auto-save (2 s debounce) ──────────────────────────────────────────────

  const triggerAutoSave = useCallback(
    (currentQ1: string, currentQ2: string) => {
      if (isInitializingRef.current || !currentQ1.trim()) return;

      if (debounceRef.current) clearTimeout(debounceRef.current);

      debounceRef.current = setTimeout(async () => {
        setSaveStatus("saving");
        try {
          const res = await fetch(`/api/arc/series/${seriesId}/reflection`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ q1: currentQ1, q2: currentQ2 }),
          });
          if (res.ok) {
            const data = await res.json();
            const savedAt = new Date(data.updatedAt);
            setLastSavedAt(savedAt);
            setLastSavedDisplay(formatRelativeTime(savedAt));
            setSaveStatus("saved");
          } else {
            setSaveStatus("idle");
          }
        } catch {
          setSaveStatus("idle");
        }
      }, 2_000);
    },
    [seriesId],
  );

  // ── Field handlers ────────────────────────────────────────────────────────

  function handleQ1Change(val: string) {
    setQ1(val);
    triggerAutoSave(val, q2);
  }

  function handleQ2Change(val: string) {
    setQ2(val);
    triggerAutoSave(q1, val);
  }

  // ── Save explicitly (used by Save & close + pre-generate) ─────────────────

  async function persistNow(currentQ1: string, currentQ2: string) {
    if (!currentQ1.trim()) return;
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
    setSaveStatus("saving");
    try {
      const res = await fetch(`/api/arc/series/${seriesId}/reflection`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ q1: currentQ1.trim(), q2: currentQ2.trim() }),
      });
      if (res.ok) {
        const data = await res.json();
        const savedAt = new Date(data.updatedAt);
        setLastSavedAt(savedAt);
        setLastSavedDisplay(formatRelativeTime(savedAt));
        setSaveStatus("saved");
      }
    } catch {
      setSaveStatus("idle");
    }
  }

  // ── Action handlers ───────────────────────────────────────────────────────

  function handleClickClose() {
    onOpenChange(false);
  }

  async function handleSaveAndClose() {
    await persistNow(q1, q2);
    onOpenChange(false);
  }

  function handleClickGenerate() {
    // First click → show confirmation
    setPhase("confirming");
  }

  function handleCancelConfirm() {
    setPhase("ready");
  }

  async function handleConfirmGenerate() {
    // Ensure reflection is persisted before the generate-next call reads it.
    await persistNow(q1, q2);
    setPhase("generating");

    try {
      const res = await fetch(
        `/api/arc/series/${seriesId}/generate-next`,
        { method: "POST" },
      );
      const data = await res.json();

      if (res.status === 201) {
        onGenerated(data.arcId);
        onOpenChange(false);
      } else {
        setErrorMessage(
          data.error ?? "Generation failed. Please try again.",
        );
        setPhase("error");
      }
    } catch {
      setErrorMessage("Network error. Please try again.");
      setPhase("error");
    }
  }

  function handleBackFromError() {
    setErrorMessage("");
    setPhase("ready");
  }

  // ── Derived ───────────────────────────────────────────────────────────────

  const isLocked = phase === "generating";
  const q1Empty = !q1.trim();

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <DialogRoot open={open} onOpenChange={isLocked ? undefined : onOpenChange}>
      <DialogContent
        showClose={!isLocked}
        onEscapeKeyDown={isLocked ? (e) => e.preventDefault() : undefined}
        onInteractOutside={isLocked ? (e) => e.preventDefault() : undefined}
        className="max-h-[90vh] w-[calc(100vw-2rem)] max-w-3xl overflow-y-auto rounded-xl border border-purple-500/20 sm:w-full">
        {/* ── Header ─────────────────────────────────────────────────── */}
        <div className="border-b border-purple-500/10 px-8 pb-6 pt-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="mb-2 text-xs uppercase tracking-widest text-purple-400/60">
                EPISODE {episodeNumber} · DRAFT
              </div>
              <h2 className="font-heading text-2xl font-bold text-white">
                {characterName} · Reflection
              </h2>
              <div className="mt-2 text-sm text-purple-300/70">
                {canGenerate ? (
                  <span className="text-green-400/80">Ready to continue</span>
                ) : (
                  <>
                    Episode {episodeNumber} unlocks in{" "}
                    <span className="text-purple-200">
                      {daysRemaining} day{daysRemaining !== 1 ? "s" : ""}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Auto-save indicator */}
            <div className="mt-1 min-w-[130px] text-right text-xs text-purple-400/60">
              {saveStatus === "saving" && (
                <span className="flex items-center justify-end gap-1.5 text-purple-400">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Saving…
                </span>
              )}
              {saveStatus === "saved" && lastSavedAt && (
                <span className="flex items-center justify-end gap-1.5 text-purple-300/70">
                  <Check className="h-3 w-3 text-green-400" />
                  {lastSavedDisplay === "just now"
                    ? "Saved"
                    : `Saved ${lastSavedDisplay}`}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ── Body ───────────────────────────────────────────────────── */}
        <div className="space-y-8 px-8 py-6">
          {phase === "loading" ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-purple-400" />
            </div>
          ) : (
            <>
              {/* Q1 */}
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-purple-200">
                    What happened with your mission?
                  </p>
                  <p className="mt-0.5 text-xs text-purple-400/60">
                    Did you do it, try it, avoid it — tell the story of that.
                  </p>
                </div>
                <textarea
                  value={q1}
                  onChange={(e) => handleQ1Change(e.target.value)}
                  disabled={isLocked}
                  placeholder="Write freely. There's no wrong answer."
                  className={cn(
                    "field-sizing-content min-h-[9rem] w-full resize-none rounded-lg border border-purple-500/20 bg-purple-950/30 px-4 py-3 text-sm text-purple-100 placeholder:text-purple-500/40 transition-colors focus:border-purple-400/40 focus:outline-none",
                    "disabled:cursor-not-allowed disabled:opacity-50",
                  )}
                />
              </div>

              {/* Q2 */}
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-purple-200">
                    Anything else?
                  </p>
                  <p className="mt-0.5 text-xs text-purple-400/60">
                    A moment, a conversation, a dream, something you noticed about yourself. Optional.
                  </p>
                </div>
                <textarea
                  value={q2}
                  onChange={(e) => handleQ2Change(e.target.value)}
                  disabled={isLocked}
                  placeholder="Optional — skip it if nothing comes."
                  className={cn(
                    "field-sizing-content min-h-[6rem] w-full resize-none rounded-lg border border-purple-500/20 bg-purple-950/30 px-4 py-3 text-sm text-purple-100 placeholder:text-purple-500/40 transition-colors focus:border-purple-400/40 focus:outline-none",
                    "disabled:cursor-not-allowed disabled:opacity-50",
                  )}
                />
              </div>

              {/* Inline confirmation */}
              {phase === "confirming" && (
                <div className="rounded-lg border border-purple-400/20 bg-purple-950/40 px-5 py-4 text-sm leading-relaxed text-purple-200">
                  This will end your reflection window and generate Episode{" "}
                  {episodeNumber}. Are you ready?
                </div>
              )}

              {/* Inline error */}
              {phase === "error" && (
                <div className="rounded-lg border border-red-500/30 bg-red-950/30 px-5 py-4 text-sm leading-relaxed text-red-300">
                  {errorMessage}
                </div>
              )}

              {/* Generating progress */}
              {phase === "generating" && (
                <div className="flex items-center gap-3 py-2 text-sm text-purple-300">
                  <Loader2 className="h-4 w-4 shrink-0 animate-spin text-purple-400" />
                  {GENERATING_LABELS[generatingStage]}
                </div>
              )}
            </>
          )}
        </div>

        {/* ── Footer ─────────────────────────────────────────────────── */}
        {phase !== "loading" && phase !== "generating" && (
          <div className="flex items-center justify-between px-8 pb-8">
            {/* Left action */}
            {phase === "confirming" ? (
              <Button
                variant="ghost"
                onClick={handleCancelConfirm}
                className="text-purple-400 hover:text-purple-200">
                Back
              </Button>
            ) : phase === "error" ? (
              <Button
                variant="ghost"
                onClick={handleBackFromError}
                className="text-purple-400 hover:text-purple-200">
                Back
              </Button>
            ) : (
              <Button
                variant="ghost"
                onClick={handleClickClose}
                className="text-purple-400 hover:text-purple-200">
                Close
              </Button>
            )}

            {/* Right action */}
            {phase === "confirming" ? (
              <Button
                onClick={handleConfirmGenerate}
                className="bg-linear-to-r from-green-700 to-green-600 px-6 text-white hover:from-green-600 hover:to-green-500">
                Yes, generate →
              </Button>
            ) : canGenerate ? (
              <Button
                onClick={handleClickGenerate}
                disabled={q1Empty}
                className="bg-linear-to-r from-[#534AB7] to-[#6B5FD8] px-6 text-white hover:from-[#6B5FD8] hover:to-[#7F73E8] disabled:opacity-40">
                Generate Episode {episodeNumber}
              </Button>
            ) : (
              <Button
                onClick={handleSaveAndClose}
                disabled={q1Empty}
                variant="outline"
                className="border-purple-400/30 text-purple-200 hover:bg-purple-500/10 disabled:opacity-40">
                Save &amp; close
              </Button>
            )}
          </div>
        )}
      </DialogContent>
    </DialogRoot>
  );
}

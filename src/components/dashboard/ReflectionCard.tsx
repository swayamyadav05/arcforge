"use client";

import { cn } from "@/lib/utils";

interface ReflectionCardProps {
  seriesId: string;
  characterName: string;
  episodeNumber: number;
  daysSincePrev: number;
  hasDraft: boolean;
  missionPreview: string;
  onClick: () => void;
}

export default function ReflectionCard({
  episodeNumber,
  daysSincePrev,
  hasDraft,
  missionPreview,
  onClick,
}: ReflectionCardProps) {
  const isReady = daysSincePrev >= 7;
  const daysRemaining = Math.max(0, 7 - daysSincePrev);

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Write reflection for Episode ${episodeNumber}`}
      className="group w-full text-left">
      <div className="h-full rounded-xl border border-dashed border-purple-500/30 bg-purple-950/20 p-6 transition-all duration-300 hover:border-purple-400/50 hover:bg-purple-950/30">
        <div className="mb-4 flex items-start justify-between">
          <div className="text-xs font-medium uppercase tracking-widest text-purple-400/60">
            EPISODE {episodeNumber} · UPCOMING
          </div>
          {hasDraft && (
            <div className="text-xs text-purple-400/50">Draft saved</div>
          )}
        </div>

        <p className="mb-6 line-clamp-2 text-sm italic leading-relaxed text-purple-300/60">
          {missionPreview || "Your next episode awaits."}
        </p>

        <div className="flex items-center border-t border-purple-500/15 pt-4">
          <span
            className={cn(
              "text-sm font-medium",
              isReady ? "text-purple-300" : "text-purple-400/60",
            )}>
            {isReady ? (
              <>
                Ready to continue{" "}
                <span className="animate-pulse">→</span>
              </>
            ) : (
              `Ready in ${daysRemaining} day${daysRemaining !== 1 ? "s" : ""}`
            )}
          </span>
        </div>
      </div>
    </button>
  );
}

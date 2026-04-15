import { cn } from "@/lib/utils";

interface EpisodeLabelProps {
  episodeNumber: number;
  title?: string;
  className?: string;
}

function getEpisodeTitle(episodeNumber: number): string {
  const index = Math.max(episodeNumber - 1, 0);

  if (index === 0) return "THE AWAKENING";
  if (index === 1) return "THE CONFRONTATION";
  return "THE CONTINUATION";
}

export default function EpisodeLabel({
  episodeNumber,
  title,
  className,
}: EpisodeLabelProps) {
  const resolvedTitle = title ?? getEpisodeTitle(episodeNumber);

  return (
    <p
      className={cn(
        "text-xs uppercase tracking-widest text-purple-400/60",
        className,
      )}>
      EPISODE {String(episodeNumber).padStart(2, "0")} ·{" "}
      {resolvedTitle}
    </p>
  );
}

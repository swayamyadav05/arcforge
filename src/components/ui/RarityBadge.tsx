import type { ArcRarity } from "@/types/arc";
import { cn } from "@/lib/utils";

interface RarityBadgeProps {
  rarity: ArcRarity;
  variant?: "outline" | "gradient";
  className?: string;
}

const OUTLINE_STYLES: Record<
  ArcRarity,
  { bg: string; border: string; text: string }
> = {
  Common: { bg: "#64748b20", border: "#64748b60", text: "#94a3b8" },
  Rare: { bg: "#378ADD20", border: "#378ADD60", text: "#85B7EB" },
  Mythic: { bg: "#D946EF20", border: "#D946EF60", text: "#F0ABFC" },
  Legendary: {
    bg: "#EF9F2720",
    border: "#EF9F2760",
    text: "#FAC775",
  },
};

const GRADIENT_STYLES: Record<ArcRarity, string> = {
  Common: "from-gray-400/20 to-gray-300/20",
  Rare: "from-blue-500/20 to-cyan-400/20",
  Mythic: "from-purple-500/20 to-pink-400/20",
  Legendary: "from-amber-500/20 to-yellow-300/20",
};

export default function RarityBadge({
  rarity,
  variant = "gradient",
  className,
}: RarityBadgeProps) {
  if (variant === "outline") {
    const style = OUTLINE_STYLES[rarity];

    return (
      <span
        className={cn(
          "rounded-full px-3 py-1 text-xs font-medium",
          className,
        )}
        style={{
          background: style.bg,
          border: `1px solid ${style.border}`,
          color: style.text,
        }}>
        {rarity.toUpperCase()}
      </span>
    );
  }

  return (
    <span
      className={cn(
        "rounded-full bg-linear-to-r px-3 py-1 text-xs font-medium text-white shadow-lg",
        GRADIENT_STYLES[rarity],
        className,
      )}>
      {rarity}
    </span>
  );
}

// src/components/arc/ArcCard.tsx
import { GeneratedArc, ArcRarity } from "@/types/arc";

interface ArcCardProps {
  arc: GeneratedArc;
  arcId: string;
  episodeNumber: number;
  bodyText: string;
  subtitle?: string;
  compact?: boolean;
}

const RARITY_STYLES: Record<
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

export default function ArcCard({
  arc,
  // arcId,
  episodeNumber,
  bodyText,
  subtitle,
  compact = false,
}: ArcCardProps) {
  const isLarge = !compact;
  const width = isLarge ? "400px" : "340px";
  const padding = isLarge ? "32px" : "24px";
  const rarity = arc.rarity ?? "Rare";
  const rarityStyle = RARITY_STYLES[rarity];
  const epLabel = `ARCFORGE // EPISODE ${String(episodeNumber).padStart(2, "0")}`;

  return (
    <div
      style={{
        width,
        background: "linear-gradient(135deg, #26215C 0%, #534AB7 100%)",
        borderRadius: "12px",
        padding,
        border: "1px solid rgba(147, 129, 255, 0.2)",
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
        fontFamily: "Inter, sans-serif",
        color: "#ffffff",
        position: "relative",
      }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "24px",
        }}>
        <div
          style={{
            fontSize: "11px",
            letterSpacing: "0.1em",
            color: "rgba(216, 208, 255, 0.6)",
            fontWeight: "500",
          }}>
          {epLabel}
        </div>
        <div
          style={{
            padding: "4px 12px",
            borderRadius: "999px",
            fontSize: "11px",
            background: rarityStyle.bg,
            border: `1px solid ${rarityStyle.border}`,
            color: rarityStyle.text,
            fontWeight: "500",
          }}>
          {rarity.toUpperCase()}
        </div>
      </div>

      {/* Character name */}
      <h2
        style={{
          fontSize: isLarge ? "36px" : "28px",
          fontWeight: "700",
          marginBottom: "8px",
          fontFamily: "Outfit, sans-serif",
          lineHeight: "1.2",
          color: "#ffffff",
        }}>
        {arc.character_name}
      </h2>

      {/* Subtitle — archetype for ep1, episode title for ep N+ */}
      <div
        style={{
          fontSize: "14px",
          color: "rgba(209, 196, 255, 1)",
          marginBottom: "16px",
        }}>
        {subtitle ?? arc.archetype}
      </div>

      {/* Body text — current episode's scene/scenario */}
      <div
        style={{
          fontSize: "14px",
          color: "rgba(255, 255, 255, 0.9)",
          marginBottom: "24px",
          textAlign: "justify",
          lineHeight: "1.6",
        }}>
        {bodyText}
      </div>

      {/* Numeric stats — always from Episode 1 identity */}
      <div
        style={{
          paddingTop: "16px",
          borderTop: "1px solid rgba(147, 129, 255, 0.2)",
        }}>
        {arc.numeric_stats && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "12px",
              marginBottom: "24px",
              fontSize: "14px",
            }}>
            {(
              [
                ["Resolve", arc.numeric_stats.resolve],
                ["Chaos", arc.numeric_stats.chaos],
                ["Empathy", arc.numeric_stats.empathy],
                ["Focus", arc.numeric_stats.focus],
              ] as [string, number][]
            ).map(([label, value]) => (
              <div
                key={label}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                }}>
                <span style={{ color: "rgba(209, 196, 255, 1)" }}>
                  {label}
                </span>
                <span style={{ color: "#ffffff", fontWeight: "500" }}>
                  {value}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Locked final form */}
      <div
        style={{
          paddingTop: "16px",
          borderTop: "1px solid rgba(147, 129, 255, 0.2)",
        }}>
        <div
          style={{
            display: "flex",
            gap: "4px",
            marginBottom: "8px",
          }}>
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              style={{
                width: "24px",
                height: "8px",
                background: "rgba(147, 129, 255, 0.2)",
                borderRadius: "2px",
              }}
            />
          ))}
        </div>
        <div
          style={{
            fontSize: "11px",
            color: "rgba(209, 196, 255, 0.6)",
          }}>
          <span>unlock more on arcforge.me</span>
        </div>
      </div>
    </div>
  );
}

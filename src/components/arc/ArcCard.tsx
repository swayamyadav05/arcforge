// src/components/arc/ArcCard.tsx
import { GeneratedArc, ArcRarity } from "@/types/arc";

interface ArcCardProps {
  arc: GeneratedArc;
  arcId: string;
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
  compact = false,
}: ArcCardProps) {
  const isLarge = !compact;
  const width = isLarge ? "400px" : "340px";
  const padding = isLarge ? "32px" : "24px";
  const rarity = arc.rarity ?? "Rare";
  const rarityStyle = RARITY_STYLES[rarity];

  return (
    <div
      style={{
        width,
        background:
          "linear-gradient(135deg, #26215C 0%, #534AB7 100%)",
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
          ARCFORGE // EPISODE 01
        </div>
        {/* Rarity badge uses our colour system rather than Emergent's
            generic style — the colour communicates tier at a glance */}
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

      {/* Archetype */}
      <div
        style={{
          fontSize: "14px",
          color: "rgba(209, 196, 255, 1)",
          marginBottom: "16px",
        }}>
        {arc.archetype}
      </div>

      {/* Ability — signature move framed as a superpower */}
      <div
        style={{
          fontSize: "14px",
          color: "rgba(255, 255, 255, 0.9)",
          marginBottom: "24px",
          lineHeight: "1.6",
        }}>
        <span
          style={{
            color: "rgba(209, 196, 255, 1)",
            fontWeight: "500",
          }}>
          Ability:
        </span>{" "}
        {arc.signature_move}
      </div>

      {/* Numeric stats — 2x2 grid, label left value right */}
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

      {/* Rival and mentor */}
      <div style={{ marginBottom: "24px", fontSize: "12px" }}>
        {[
          ["Rival", arc.rivals_and_mentors.the_rival.name],
          ["Mentor", arc.rivals_and_mentors.the_mentor.name],
        ].map(([role, name]) => (
          <div
            key={role}
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "8px",
            }}>
            <span style={{ color: "rgba(209, 196, 255, 1)" }}>
              {role}
            </span>
            <span style={{ color: "rgba(255, 255, 255, 0.9)" }}>
              {name}
            </span>
          </div>
        ))}
      </div>

      {/* Opening quote — truncated to 100 chars for card context.
          The full quote appears in the page header above the card. */}
      <div
        style={{
          fontStyle: "italic",
          fontSize: "14px",
          color: "rgba(216, 208, 255, 0.8)",
          lineHeight: "1.6",
          marginBottom: "24px",
        }}>
        &quot;{arc.opening_episode_quote?.substring(0, 100)}...&quot;
      </div>

      {/* Locked final form */}
      <div
        style={{
          paddingTop: "16px",
          borderTop: "1px solid rgba(147, 129, 255, 0.2)",
        }}>
        <div
          style={{
            fontSize: "11px",
            color: "rgba(209, 196, 255, 0.6)",
            marginBottom: "8px",
          }}>
          FINAL FORM // LOCKED
        </div>
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
          unlock on arcforge.me
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import ArcCard from "./ArcCard";
import { GeneratedArc } from "@/types/arc";

interface ArcCardInteractiveProps {
  arc: GeneratedArc;
  arcId: string;
  shareUrl: string;
  compact?: boolean; // pass through to ArcCard for landing page context
}

export default function ArcCardInteractive({
  arc,
  arcId,
  compact,
}: ArcCardInteractiveProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "16px",
      }}>
      {/* Hover wrapper — the tilt effect lives here rather than inside
          ArcCard itself, keeping ArcCard pure and @vercel/og compatible.
          scale(1.02) gives a subtle lift feeling alongside the tilt,
          reinforcing the physical card metaphor. */}
      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          transform: isHovered
            ? "rotate(-1deg) scale(1.02)"
            : "rotate(0deg) scale(1)",
          transition: "transform 0.4s ease",
          cursor: "pointer",
        }}>
        <ArcCard arc={arc} arcId={arcId} compact={compact} />
      </div>
    </div>
  );
}

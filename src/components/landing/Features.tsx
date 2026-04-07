// src/components/landing/Features.tsx
"use client";

// motion is client-only, so this entire component must be a client component.
// The whileInView animations won't work in a server component context because
// the IntersectionObserver API that powers them only exists in the browser.
import { motion } from "motion/react";
import { Sparkles, BrainCircuit, Layers, Cpu } from "lucide-react";

// Defining features as a typed array outside the component means the array
// is created once when the module loads rather than on every render.
// For a static landing page this is a micro-optimisation, but it's also
// cleaner to read — the data and the rendering logic are separated.
const features = [
  {
    title: "Cinematic Narrative Engine",
    description:
      "Not a quiz. A storyteller that reads between the lines of what you reveal — crafting a multi-act structure from your inciting incident to your ultimate resolution.",
    // Sparkles spans two columns as the hero feature card
    icon: <Sparkles className="w-12 h-12 text-forge-purple-400" />,
    // bgIcon is a large decorative version of the same icon,
    // positioned absolute in the card's top-right corner at low opacity
    bgIcon: (
      <Sparkles className="absolute top-0 right-0 p-8 opacity-[0.07] w-45 h-45 text-forge-purple-400 pointer-events-none" />
    ),
    colSpan: "md:col-span-2",
  },
  {
    title: "8 Questions. One Arc.",
    description:
      "Each question is designed to extract something real. The arc that emerges feels written for you because it was.",
    icon: <BrainCircuit className="w-8 h-8 text-[#F0ABFC]" />,
    colSpan: "",
  },
  {
    title: "Collectible Arcs",
    description:
      "Every identity is minted as a high-fidelity digital card with unique rarity levels — Common through Legendary.",
    icon: <Layers className="w-8 h-8 text-forge-purple-400" />,
    colSpan: "",
  },
  {
    title: "Powered by Claude",
    description:
      "The same AI powering the world's most sophisticated applications — now forging your personal story with emotional precision.",
    icon: <Cpu className="w-8 h-8 text-[#D8B4FE]" />,
    colSpan: "md:col-span-2",
    // The spinning Claude icon is the "extra" element that appears
    // alongside the text on this wide card, adding visual interest
    // without requiring any actual image assets
    extra: (
      <div className="w-30 h-30 min-w-30 rounded-[12px] bg-white/4 border border-white/8 flex items-center justify-center">
        {/* This continuous rotation animation subtly communicates that
            Claude is "thinking" — a living, active intelligence rather
            than a static tool. The 10-second duration is slow enough
            to feel calm rather than frantic. */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "linear",
          }}>
          <Cpu className="w-12 h-12 text-[#D8B4FE]/40" />
        </motion.div>
      </div>
    ),
  },
];

export default function Features() {
  return (
    // mt-40 creates generous vertical separation from the hero section above.
    // This breathing room is important — it signals to the visitor that they've
    // moved from the "hook" section into the "explanation" section of the page.
    <section className="max-w-screen-2xl mx-auto px-8 pt-9 pb-25">
      {/* Optional section label above the grid — establishes context
          before the visitor reads any individual feature card */}
      <div className="mb-12">
        <p className="text-[11px] font-medium tracking-[0.12em] uppercase text-[#7F77DD] mb-3">
          Why ArcForge
        </p>
        <h2 className="text-[clamp(1.75rem,4vw,2.5rem)] font-bold text-[#EEEDFE] font-heading max-w-120 leading-[1.2]">
          Built for the generation that lives in stories.
        </h2>
      </div>

      {/* Bento grid — the asymmetric layout means some cards span
          two columns, creating natural visual hierarchy. The first
          and last features are "wide" cards that span the full two
          columns, making them feel more important than the middle two.
          This matches the actual importance of those features —
          the narrative engine and Claude integration are the core
          differentiators, while the 8 questions and collectibles
          are supporting features. */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {features.map((feature, index) => (
          <motion.div
            key={index}
            // whileInView fires when the element enters the viewport,
            // creating the effect that content materialises as you scroll.
            // viewport={{ once: true }} means it only fires once —
            // scrolling back up and down won't replay the animation,
            // which would feel annoying and cheap.
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            // Staggered delay — each card animates in slightly after
            // the previous one. At 0.1s per card, the full grid takes
            // 0.4s to complete, which reads as a smooth cascade rather
            // than a jarring simultaneous pop.
            transition={{ delay: index * 0.1, duration: 0.5 }}
            className={`glass-card rounded-xl border border-white/6 relative overflow-hidden p-8 ${feature.colSpan}`}>
            {/* Decorative background icon — only present on the first card */}
            {feature.bgIcon}

            {/* Card content — z-index 10 ensures it sits above the
                decorative background icon on the first card */}
            <div
              className={`relative z-10 flex h-full ${
                feature.extra
                  ? "flex-row items-center gap-8"
                  : "flex-col items-start"
              }`}>
              {/* Text content block */}
              <div className="flex-1">
                <div className="mb-6">{feature.icon}</div>
                <h4 className="text-[20px] font-bold text-[#EEEDFE] font-heading mb-2.5">
                  {feature.title}
                </h4>
                <p className="text-sm text-[#D8B4FE] leading-[1.7]">
                  {feature.description}
                </p>
              </div>

              {/* Extra element — only present on the "Powered by Claude" card */}
              {feature.extra}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

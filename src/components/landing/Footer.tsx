// src/components/landing/Footer.tsx
// Server component — no "use client" needed because Tailwind hover
// classes are handled entirely by CSS, not JavaScript event listeners.
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-forge-bg-deepest border-t border-white/5 py-12 px-8">
      <div className="max-w-screen-2xl mx-auto flex flex-row justify-between items-center gap-6 flex-wrap">
        {/* Left side — brand name and copyright */}
        <div className="flex flex-col gap-1">
          <span
            className="text-base font-bold uppercase tracking-tighter text-[#EEEDFE]"
            style={{
              fontFamily: "var(--font-heading)",
            }}>
            ArcForge
          </span>
          <p className="text-xs uppercase tracking-widest text-[#AFA9EC]/40">
            © 2026 ArcForge. Define your legacy.
          </p>
        </div>

        {/* Right side — navigation links using Tailwind hover classes.
            The key insight: hover: prefix generates real CSS pseudo-selector
            rules, so the browser handles the colour change natively.
            No JavaScript event handlers needed at all. */}
        <div className="flex gap-8 flex-wrap">
          {[
            { label: "Discord", href: "#" },
            { label: "Twitter", href: "#" },
            { label: "Terms", href: "#" },
            { label: "Privacy", href: "#" },
          ].map(({ label, href }) => (
            <Link
              key={label}
              href={href}
              className="text-xs uppercase tracking-widest font-medium text-forge-purple-400 hover:text-[#EEEDFE] transition-colors duration-200 no-underline">
              {label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}

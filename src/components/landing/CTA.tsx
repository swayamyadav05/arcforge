// src/components/landing/CTA.tsx
// No "use client" needed — this is a purely static component.
// Server components are the correct default for presentational content
// that contains no interactivity, animations, or browser APIs.
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function CTA() {
  return (
    <section className="bg-[rgba(83,74,183,0.08)] border-y border-[rgba(83,74,183,0.2)] py-25 px-8 text-center">
      <div className="max-w-140 mx-auto">
        {/* The headline is deliberately short and confident.
            "Your arc is waiting." implies inevitability —
            not "start your journey" (generic) but a specific
            thing that already exists and is waiting to be claimed. */}
        <h2 className="text-[clamp(2rem,5vw,3rem)] font-bold text-[#EEEDFE] font-heading leading-[1.15] mb-5">
          Your arc is waiting.
        </h2>

        {/* The subtext addresses the two biggest hesitations a
            visitor might have: "how long will this take?" and
            "will it actually mean anything?" Both answered in
            one sentence without sounding like a sales pitch. */}
        <p className="text-[17px] text-[#D8B4FE] leading-[1.7] mb-10 font-body">
          It takes 4 minutes. It might change how you see yourself.
        </p>

        <Button size="lg" asChild>
          <Link href="/quiz">Forge my arc →</Link>
        </Button>
      </div>
    </section>
  );
}

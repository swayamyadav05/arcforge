# LinkedIn Story Roadmap

The LinkedIn founder narrative unfolds chronologically. Each Act covers a phase of the journey. Each Beat is a topic. Each Beat has 2 Angles so you can cover it from multiple perspectives across multiple posts.

**Current Act**: Act 2 (Phase 1 build + launch)

When a post is written for a beat+angle, check it off. When all angles in all beats of an act are done, mark the act complete and advance.

---

## Act 1 — The Spark
*Goal: establish why I'm building this, who it's for, why now*
*Target: 2-3 posts*

- [ ] **Beat 1.1** — The origin moment
  - [ ] Angle A: the personal observation that made me think "anime identity deserves better than BuzzFeed quizzes"
  - [ ] Angle B: the convergence insight — Gen Z + anime + AI + identity content all hit at the same time

- [ ] **Beat 1.2** — Why this market, why now
  - [ ] Angle A: the numbers that made the bet make sense ($35B anime market, 54% Gen Z, 45% create content)
  - [ ] Angle B: why existing "which character are you" products miss — they give you a label, not a story

- [ ] **Beat 1.3** — The solo founder bet
  - [ ] Angle A: deciding to build alone — what I can do, what I can't
  - [ ] Angle B: the "zero paid acquisition" thesis and why the artifact has to be the ad

---

## Act 2 — Phase 1 Build (CURRENT)
*Goal: document the technical journey + early user reality*
*Target: 5-7 posts across the build*

- [ ] **Beat 2.1** — Architecture decisions
  - [ ] Angle A: why Next.js monolith on Vercel (resisting premature microservices)
  - [ ] Angle B: Prisma + Neon over Supabase — the comfort-zone tradeoff I made consciously

- [ ] **Beat 2.2** — The prompt engineering journey
  - [ ] Angle A: making arcs feel emotionally real, not generic — the "true self" bug story
  - [ ] Angle B: the system prompt as the actual product — how much of ArcForge is literally a prompt

- [ ] **Beat 2.3** — Anonymous-first auth decision
  - [ ] Angle A: why I killed the signup wall before launch
  - [ ] Angle B: rate limiting when you have no user accounts — IP + fingerprint game

- [ ] **Beat 2.4** — The Arc Card as the growth engine
  - [ ] Angle A: designing for screenshot — the card is the product
  - [ ] Angle B: `@vercel/og` at edge runtime, the technical constraints that shaped the design

- [ ] **Beat 2.5** — First users, first feedback
  - [ ] Angle A: the launch, the anxiety, the first 17 users
  - [ ] Angle B: what I got wrong about what early users would share

- [ ] **Beat 2.6** — Instrumentation hindsight
  - [ ] Angle A: launching without PostHog/Sentry and paying for it — adding telemetry after the fact
  - [ ] Angle B: the analytics I wish I'd had from day one

---

## Act 3 — Phase 2 Build
*Goal: the retention thesis — turning one-shot virality into ongoing engagement*
*Target: 5-7 posts during Phase 2 build*

- [ ] **Beat 3.1** — Why episodes?
  - [ ] Angle A: the retention math — viral products die without a return reason
  - [ ] Angle B: how weekly episodes mirror how anime itself creates commitment

- [ ] **Beat 3.2** — Cron + subscription event architecture
  - [ ] Angle A: the hybrid trigger design and why I didn't just use cron alone
  - [ ] Angle B: the "what if the cron fires twice" anxiety and how I handled idempotency

- [ ] **Beat 3.3** — Making subscription feel optional
  - [ ] Angle A: designing the upgrade path without pushing it
  - [ ] Angle B: Stripe integration for a freemium product that shouldn't feel freemium

- [ ] **Beat 3.4** — First paying user
  - [ ] Angle A: the moment someone paid for their arc
  - [ ] Angle B: what converting users actually told me about the product

---

## Act 4 — Growth Reality
*TBD based on what actually happens. Beats will be added as the journey unfolds.*

Potential beats (don't commit yet):
- Distribution experiments that worked / didn't
- Merch launch (Phase 3)
- Discord community build
- Retention data after episodes ship

---

## Editing this roadmap

- Check off angles as posts go live (add the date next to the checkbox)
- Add new beats as relevant milestones emerge
- Reorder if reality diverges from the plan — the roadmap serves the story, not the other way around
- Don't force a beat to happen if the organic story has moved past it

## For the generator

When generating a LinkedIn post, the generator should:
1. Identify the current act (first act with unchecked angles)
2. Within that act, pick the next unchecked angle (roughly top-to-bottom)
3. If user specified a beat-angle ID (e.g. `beat-2.3-a`), use that instead
4. After writing the post draft, reference the beat ID in the output header so it can be checked off after posting

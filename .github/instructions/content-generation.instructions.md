---
description: "ArcForge content generation rules — voice, pillars, output constraints"
applyTo: ".github/content-context/**,.github/prompts/generate.prompt.md"
---

# ArcForge Content Generation — Rules

These instructions apply only when working with files under `.github/content-context/` or running the `/generate` prompt. They do NOT apply to application code in `src/`.

## Purpose
Generate cross-platform marketing content (Twitter, LinkedIn, Discord) for ArcForge that matches the product's voice, avoids AI-slop patterns, and maintains narrative coherence on LinkedIn via the roadmap system.

## Core Rules

### Reading context
- Always read ALL files referenced in the prompt before generating. Skipping context files produces generic content.
- Voice example banks in `.github/content-context/voice/*.md` are authoritative. If output doesn't match those examples, rewrite.
- History file (`posted.md`) MUST be checked before picking a pillar — no pillar repeats within last 3 posts per platform.
- `arc-schema.md` is the authoritative field reference for arc outputs. Use real field names, not guesses.

### Private arcs — absolute rule
- Arcs in `.github/content-context/arcs-private/` are SCHEMA REFERENCE ONLY
- Never use a private arc as a "source arc" for generated content
- Never quote specific field values from private arcs (character_name, signature_move name, rival name, mentor name, opening quote, scenario, truth_they_avoid, etc.)
- Private arcs inform the generator's sense of real-arc depth and structure — nothing more
- Public source arcs come from `.github/content-context/arcs/` only

### Voice calibration
- Twitter: lowercase-friendly, 0 hashtags, 0-1 emoji, first 5 words matter most, brevity wins.
- LinkedIn: first-person founder POV, 150-300 words, specific-over-abstract, 2-3 hashtags max at end, no listicle hooks ("3 lessons I learned"), no "🚀 Excited to announce..."
- Discord: casual lowercase, 2-4 sentences, zero hashtags, always include arcforge.me link, honest about being the builder if asked.

### Forbidden patterns (all platforms)
- "Unlock your potential", "revolutionize", "game-changer", "passionate about", "dive deep into"
- Emoji strings (🔥🚀💯)
- Engagement-bait questions like "Ever wondered what your anime arc would be?"
- Corporate announcement voice: "Excited to announce that..."
- Fake urgency: "ONLY TODAY"
- Listicle hooks: "3 things I learned...", "Here are 5 ways..."
- Quotable-metaphor-mining ("fear wearing the costume of sacrifice," "love letter to everyone who ever felt X")
- Vague descriptors in place of specifics ("pretty unhinged," "kinda wild," "really cool")

### Output file rules
- Output goes to `.github/content-context/output/YYYY-MM-DD.md` using today's actual date
- If file exists, append as `## Run 2`, `## Run 3`, etc. — never overwrite
- Header metadata (Pillar, Beat, Source arc, Callback) must be filled accurately

### Pillar rotation (6 pillars)
Available: `unhinged-outputs`, `archetype-lore`, `rate-this-arc`, `prompt-engineering`, `feature-tease`, `bad-end-warnings`

- No pillar appears in 2 consecutive posts on same platform
- Weekly target mix: 2× unhinged-outputs, 1× archetype-lore, 1× rate-this-arc, 1× prompt-engineering OR feature-tease, 1× bad-end-warnings max
- LinkedIn leans toward `prompt-engineering` and `feature-tease`
- `bad-end-warnings` for Twitter/Discord, rarely LinkedIn
- Never chain consecutive `bad-end-warnings` posts — one per week max

### LinkedIn narrative integrity
- LinkedIn posts must follow the roadmap (`linkedin-roadmap.md`) unless user explicitly overrides
- Current Act is the first act with unchecked angles
- Within current Act, pick next unchecked angle (roughly top-to-bottom)
- Output header must include the beat ID (e.g. `beat-2.1-a`) for post-publication tracking

### Arc specificity (public arcs only)
- When a pillar needs a source arc, pick from `.github/content-context/arcs/` (NEVER arcs-private/)
- Use the arc's actual fields from `arc-schema.md`: `archetype`, `character_name`, `signature_move`, `rivals_and_mentors.the_rival.name`, `if_they_were_a_genre`, `how_their_story_ends.BAD_END`, etc.
- Generic "here's an arc" content is worse than no content

### Field-specific rules
- `opening_episode_quote` — excerpts only, under 15 words
- `character_arc.the_wound` / `the_weapon` / `the_destiny` — paraphrase, don't quote long passages
- `episode_one_scenario` — never quote full; too diary-like
- `the_truth_they_avoid` — never quote; too raw for public posts
- `how_their_story_ends.BAD_END` — excerpt max 2 sentences; the core of the `bad-end-warnings` pillar

## Destructive operation guardrails
- Never modify `.github/content-context/voice/*.md`, `pillars.md`, `archetypes.md`, `arc-schema.md`, `product.md`, or `linkedin-roadmap.md` during a generation run — those are context files the user maintains
- Never overwrite existing output files — always append as additional runs
- Never modify `posted.md` automatically — user appends manually after posting
- Never modify any file in `.github/content-context/arcs-private/`
- Creating new files in `.github/content-context/output/` is the only file write expected during generation

## When Copilot should refuse
- If user input is harmful or defamatory content — decline and ask for clarification
- If a generation request contradicts the voice files (e.g. "generate hype-y LinkedIn posts") — follow the voice files, and note the override attempt in the output
- If a generation request explicitly asks for private arc content — refuse and explain the private-arc rule

# v2 Update — Apply Guide

This update restructures the content agent around your real arc output schema and adds safe handling for your personal arc.

## Step 1 — Delete the old fictional sample arcs

These had the wrong schema and need to go:

```bash
rm .github/content-context/arcs/sample-01.json
rm .github/content-context/arcs/sample-02.json
rm .github/content-context/arcs/sample-03.json
rm .github/content-context/arcs/sample-04.json
rm .github/content-context/arcs/sample-05.json
rm .github/content-context/arcs/sample-06.json
```

## Step 2 — Copy the new files

From this update package into your repo:

### New files (additions)
- `.github/content-context/arc-schema.md` → authoritative schema reference
- `.github/content-context/arcs-private/README.md` → private arc rules
- `.github/content-context/arcs-private/founder-arc.json` → your personal arc (schema-reference only)
- `.github/content-context/arcs/sample-01-laughing-diagnostic.json`
- `.github/content-context/arcs/sample-02-ex-gifted-kid.json`
- `.github/content-context/arcs/sample-03-sincere-enthusiast.json`
- `.github/content-context/arcs/sample-04-just-a-guy.json`
- `.github/content-context/arcs/sample-05-vaulted-artist.json`

### Replaced files (overwrite existing)
- `.github/content-context/pillars.md` → adds the 6th pillar `bad-end-warnings`
- `.github/prompts/generate.prompt.md` → references schema + private-arcs rule
- `.github/instructions/content-generation.instructions.md` → private-arcs rule + field-specific rules

## Step 3 — Commit

```bash
git add .github
git commit -m "v2: align content agent with real arc schema + add bad-end-warnings pillar + private arc handling"
```

## Step 4 — Reload VS Code window

`Cmd/Ctrl+Shift+P` → "Developer: Reload Window" so Copilot picks up the updated prompt and instructions.

## What changed and why

**New: `arc-schema.md`** — your real output has 14+ fields I was guessing at. Now the generator references the true structure (`character_name`, `signature_move`, `if_they_were_a_genre`, `how_their_story_ends.BAD_END`, etc.) instead of my simpler fictional schema.

**New: `arcs-private/` folder** — your personal arc lives here as schema reference only. The generator reads it to understand real-arc depth but is explicitly forbidden from quoting its specific content in any public post. This gives you the calibration benefit without the exposure risk.

**New: 5 fictional sample arcs matching your real schema** — covers the full user-variance range: humor-deflection Gen-Z, burnt-out high-achiever, playful-hopeful, low-effort-answers ("Just A Guy"), creative-blocked ("Vaulted Artist"). Rarities: 3 Common, 1 Uncommon, 1 Legendary.

**New pillar: `bad-end-warnings`** — your `how_their_story_ends.BAD_END` field is exceptional content fuel. Dark, shareable, specific. Used sparingly (1/week max) to avoid becoming a downer pattern.

**Tighter rules around field usage** — some fields (`the_truth_they_avoid`, full `episode_one_scenario`) are too raw for public posts even from sample arcs. Generator now knows which fields are safe to quote vs paraphrase vs never surface.

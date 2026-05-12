# Arc Output Schema — Authoritative Reference

This is the actual shape of an arc output from `/api/arc/generate`. Use these field names exactly when referencing arc data in generated posts.

## Top-level fields

```json
{
  "rarity": "Common | Uncommon | Rare | Legendary",
  "archetype": "string — e.g. 'Wandering Flame Keeper', 'Fallen Prodigy'",
  "character_name": "string — e.g. 'The Unrecorded Freestyle'",
  "signature_move": "string — named move + description, e.g. 'The Preemptive Exit — the moment X happens, Y'",
  "if_they_were_a_genre": "string — anime genre mashup, e.g. 'Mushishi meets Carole & Tuesday'",
  "opening_episode_quote": "string — first-person quote from the character",
  "the_truth_they_avoid": "string — first-person confession of an unseen truth",
  "character_flaw_that_is_also_their_strength": "string — paradoxical quality"
}
```

## Nested: `core_stats`
Four first-person statements about the character's current state. Each is a full sentence in the user's own voice.

```json
{
  "impact": "...",
  "endurance": "...",
  "conviction": "...",
  "visibility": "..."
}
```

## Nested: `character_arc`
The narrative structure of the character's journey.

```json
{
  "the_wound": "...",     // the core injury/pattern
  "the_weapon": "...",    // what the wound made them good at
  "the_destiny": "..."    // who they become if they break the pattern
}
```

## Nested: `numeric_stats`
Four integer stats, 0-100.

```json
{
  "chaos": 38,
  "focus": 34,
  "empathy": 91,
  "resolve": 72
}
```

## Nested: `rivals_and_mentors`

```json
{
  "the_rival": { "name": "string", "description": "string" },
  "the_mentor": { "name": "string", "description": "string" }
}
```

## Nested: `episode_one_mission`

```json
{
  "title": "string — short punchy mission name",
  "stakes": "string — what happens if they do/don't do it",
  "description": "string — specific concrete action the character must take"
}
```

## Nested: `how_their_story_ends`
The two possible endings. Extremely strong content fuel — the BAD_END in particular.

```json
{
  "BAD_END": "string — what happens if they stay stuck in the pattern",
  "GOOD_END": "string — what happens if they break it"
}
```

## Other fields

```json
{
  "episode_one_scenario": "string — in-scene prose, 2-4 sentences, present tense"
}
```

---

## Content generation — which fields to surface where

### Twitter
- `archetype` — great for archetype-lore posts
- `character_name` — quotable identity handle
- `signature_move` name only (not the long description) — great for "got hit with" posts
- `opening_episode_quote` — excerpt only (under 15 words for quote-tweet feel)
- `if_they_were_a_genre` — perfect for "what anime are you" posts
- `numeric_stats` — visual/graphic posts could reference stat breakdowns

### LinkedIn
- `archetype` and `rarity` — useful when discussing generation diversity
- `character_arc.the_wound` / `the_weapon` — for posts about the arc's emotional depth
- `episode_one_mission.title` — when discussing the mission/retention mechanic
- Do NOT quote long passages — paraphrase into founder observations

### Discord
- `archetype`, `character_name`, `signature_move` name, `rival.name` — perfect fuel
- `if_they_were_a_genre` for casual sharing
- Short excerpt from `opening_episode_quote` is fine
- Full `character_arc` details are too long — never paste

---

## Never expose these fields in public posts

- Full `episode_one_scenario` text (feels like personal diary entries)
- Full `the_truth_they_avoid` (raw confessional)
- Full `character_arc` prose (too long, too revealing)
- Any field from an arc stored in `.github/content-context/arcs-private/`

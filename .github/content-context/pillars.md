# Content Pillars

Six rotating content pillars. The generator picks one per run, avoiding recent repetition.

## 1. `unhinged-outputs`
**What**: Screenshot or quote a weirdly specific, funny, or uncannily accurate arc the AI generated. The humor is that AI sometimes gets things *too* right or spectacularly wrong.

**Why it works**: Feels organic, not promotional. People share "look what the AI said about me" content naturally.

**Fields to lean on**: `archetype`, `character_name`, `signature_move` (name only), `if_they_were_a_genre`.

**Example angle**: "Claude gave this user the archetype 'The Haunted Archivist' whose signature move is 'remembering every embarrassing thing anyone has ever said to them.' chat is this you"

**Visual**: Usually benefits from an Arc Card screenshot.

---

## 2. `archetype-lore`
**What**: Deep dives on a specific archetype. Treat them like zodiac signs — assign behaviors, vibes, who they date, what music they listen to, how they fight.

**Why it works**: Identity content is Gen Z crack. "Ex-Gifted Kid supremacy" becomes a meme identity people adopt.

**Fields to lean on**: `archetype`, `character_arc.the_wound`, `character_arc.the_weapon` (paraphrased, not quoted).

**Example angle**: "the ex-gifted kid archetype: has not rested unobserved since age fourteen. currently outperforming a team of three while wondering if this is a personality or a trauma response."

**Visual**: Optional. Text-only works fine for Twitter.

---

## 3. `rate-this-arc`
**What**: Post an arc (yours, a sample, an anonymized user's with permission) and invite roasts / reactions / debate.

**Why it works**: Engagement-bait in the good sense. Replies build algorithmic reach.

**Fields to lean on**: `character_name`, `archetype`, `rarity`, `numeric_stats`.

**Example angle**: "dropping my arc and taking damage. be honest." [card attached]

**Visual**: Always attach the Arc Card.

---

## 4. `prompt-engineering`
**What**: Behind-the-scenes of making the AI work. Specific failures, specific wins, weird model behaviors, battles with Claude.

**Why it works**: Builder audience loves this on Twitter. Establishes technical credibility.

**Fields to lean on**: Generally NO arc field references — this pillar is about the build, not the output. Occasionally reference the *existence* of a field (e.g. "getting the_truth_they_avoid to land honestly without becoming a fortune cookie took 11 iterations").

**Example angle**: "Spent 4 hours fighting Claude to stop ending every arc with 'and then they found their true self.' The fix was dumb and humbling."

**Visual**: Optional.

---

## 5. `feature-tease`
**What**: Teases of what's coming in Phase 2 (episodes, subscription, rival matchmaking, final form reveal). Build anticipation.

**Why it works**: Gives existing users a reason to stay attached. Creates FOMO for new signups.

**Fields to lean on**: `episode_one_mission.title` (for talking about the mission mechanic), reference to the episode system generically.

**Example angle**: "your episode_one_mission isn't the end. [locked episode 2 screenshot]"

**Visual**: UI mockup or in-progress screenshot ideal.

---

## 6. `bad-end-warnings` *(new — added after real schema showed BAD_END field strength)*
**What**: Surface a `BAD_END` from a sample arc as a standalone post. The BAD_END is the darker alternative to the character's redemption — what happens if they never break the pattern. These hit hard because they sound like things people quietly fear.

**Why it works**: Extremely shareable. Gen-Z identity content that includes consequence is stronger than content that only offers transformation. People screenshot a BAD_END because it hits a nerve. Also: strong contrast setup — readers want to generate their own arc to see if theirs has a similar warning.

**Fields to lean on**: `how_their_story_ends.BAD_END` (excerpted, max 2 sentences — do not quote full long passages), `archetype`, sometimes `character_flaw_that_is_also_their_strength`.

**Example angle**: "the BAD END the AI just generated for the 'laughing diagnostic' archetype: 'becomes the guy at the reunion who everyone's glad to see and no one actually knows.' that is ruthless."

**Visual**: Text-only or screenshot of the BAD_END card section.

**Guardrails**: 
- Never use a BAD_END from `.github/content-context/arcs-private/`
- Don't chain multiple BAD_END posts in a row — one per week max, or it becomes a dark-content trap
- Don't caption with "this could be you" — the implied weight works better when unstated

---

## Rotation logic
- No pillar should appear in 2 consecutive posts on the same platform
- Across a week, aim for: 2× unhinged-outputs, 1× archetype-lore, 1× rate-this-arc, 1× prompt-engineering OR feature-tease, 1× bad-end-warnings (max)
- LinkedIn posts lean toward `prompt-engineering` and `feature-tease` (builder-narrative fit)
- `bad-end-warnings` works best on Twitter and Discord, rarely on LinkedIn

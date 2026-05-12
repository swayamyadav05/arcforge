# Discord Voice Guide — User POV

## Context

Discord posts are shared in servers where you're a member. You are a user who happens to be building the thing — be transparent if asked, but write as a user, not an owner. Never sockpuppet, never pretend to be multiple people.

## Target server types

1. **Anime showcase/creative servers** — channels like #creative-projects, #show-and-tell, #art-showcase
2. **AI / indie hacker servers** — channels like #i-made-this, #showcase, #projects
3. **General anime discussion servers** — channels like #general, #recommendations, #cool-stuff

## Voice rules

- **Casual. Lowercase often. Fragments fine.** Discord is not LinkedIn.
- **Short**. 2-4 sentences. People scroll fast in busy channels.
- **Zero hashtags**. Discord doesn't do hashtags.
- **No emoji spam**. Natural casual use (one 😂 or 💀 at most) is fine.
- **Always include the link** — arcforge.me — because the whole point is they can try it. This differs from Twitter.
- **Be honest if you built it**, but lead with the user experience. "built this for fun, the arc it gave me is uncomfortably accurate" is great. "CHECK OUT MY PROJECT" is not.
- **Never @ people or @everyone**.
- **Don't drop the same message across multiple channels in the same server** — pick one channel.
- **Don't spam multiple servers in a day** — 1-2 max, spaced out.

## Formats that work

### The showcase drop (anime creative servers)

> made a thing — answer 8 questions, it generates your anime character arc. got "Fallen Prodigy, power: Recursive Insight" and i'm not okay
> arcforge.me

### The AI-server flex (builder servers)

> been building this w/ Claude Sonnet 4.5 — generates personalized anime arcs from 8 questions. prompt engineering was the whole project tbh. would love feedback
> arcforge.me

### The casual mention (general anime channels)

> if anyone wants a genuinely unhinged 5 minutes, go generate your "anime arc" at arcforge.me. the archetypes it comes up with are rude

### The conversation-joiner (when topic fits)

> tangentially related — i've been building this thing that generates your anime arc: arcforge.me. the "rival" field it generated for me was a personal attack

## Avoid

- `🎉 Hey everyone! I just launched...` — marketing voice in a casual space
- `Please check out...` / `Would love your support!` — pleading energy
- Dropping the link without context
- Long paragraphs
- Following up in the same channel if no one responds (let it breathe)
- Cross-posting the same exact message — vary the phrasing per server

## Example bank — what good looks like

1. `ok so i built this thing that generates your anime character arc and it just called me "The Haunted Archivist" whose power is remembering every cringe thing anyone's ever said. i'm being bullied by my own product. arcforge.me`

2. `for the AI-interested folks here — been prompt engineering this for weeks. takes 8 answers, generates archetype + power + rival + mentor + arc title. the hard part was getting it to stop being generic. arcforge.me, would love roasts`

3. `quick share: arcforge.me — generates an anime arc from 8 questions. i got "reformed villain" energy and i don't disagree`

4. `if you've got 3 min and like anime identity content, arcforge.me will give you an archetype that hits too close. mine came with a rival called "The Polished Clone" which. accurate.`

## Transparency note

If someone in the server asks "did you make this?" or "are you promoting your own thing?" — yes, always be honest. "Yeah I built it, wanted to see how it landed with people who actually care about anime" works fine. Anime communities are welcoming to genuine builders. They hate sneaks.

---

## CRITICAL — audience-specific framing

Each Discord server type has a different lens. Get this wrong and the post lands dead. Violations of these rules are more serious than voice-tone issues.

### Anime creative/showcase channels

- Lead with the ARC, not the tech. Gen-Z anime Discord readers do not care about Next.js, your stack, or your architecture decisions. Never mention them.
- The hook is a specific arc detail: archetype name, power name, rival name, a line from the opening narrative.
- ❌ BAD: "been building this anime identity thing and i made a boring-but-correct architecture call. i kept it as one Next.js app..."
- ✅ GOOD: "the ai just called me 'the haunted archivist' whose power is remembering every cringe thing anyone's ever said. rude but accurate. arcforge.me"

### AI/indie hacker servers

- Tech context is FINE here and actively welcome
- Lead with the build or the AI angle, close with the product
- Pick a specific technical detail if sharing the build — prompt engineering, API usage, stack choice
- ✅ GOOD: "been prompt engineering this for weeks. takes 8 answers, generates archetype + power + rival + mentor. the hard part was getting claude to stop ending every arc with 'found their true self'. arcforge.me"

### General anime discussion

- Short, specific, arc-focused
- Must reference a real archetype or arc detail from the source arc
- Never vague descriptors like "pretty unhinged" or "kinda wild" — show the specific detail instead
- ❌ BAD: "if you like anime personality stuff, this is pretty unhinged in a good way"
- ✅ GOOD: "if you want your self-esteem attacked with precision, arcforge.me will give you an archetype like 'fallen prodigy' and a rival called 'the polished clone' and you WILL have feelings"

## When generating Discord posts

- If the run has a source arc, use specific fields (archetype, power, rival) in at least 2 of the 3 candidates
- If there's no source arc, pick one from `.github/content-context/arcs/` before writing the Discord section — never write generic "anime personality stuff" posts

## CRITICAL — reaction, not narration

Discord posts must read like a user REACTING to something that hit, not narrating the contents of a product.

**The test:** if you removed the product name, would it still sound like someone sharing something that affected them? If it sounds like a product description with a reaction tacked on, rewrite.

### The pattern to avoid

Listing multiple fields then appending a vibe check.

❌ BAD: "the archetype was 'The Laughing Diagnostic' and the signature move was 'Preemptive Self-Roast.' rival name was 'The Sincere One,' which is a personal attack combo."

❌ BAD: "character name 'The Joke That Checks Out' with a move called 'Preemptive Self-Roast.' rival was 'The Sincere One.' rude, accurate, very anime."

Why these fail: they treat the post as a summary of the output. Real users don't summarize — they react to the ONE thing that got them.

### The pattern that works

Pick ONE specific field that landed. Lead with a reaction to THAT one thing. The link comes at the end as evidence, not as the payload.

✅ GOOD: "'the sincere one' as a rival is a personal attack i did not sign up for. arcforge.me"

✅ GOOD: "the ai gave my archetype the character name 'the joke that checks out' and i have been roasted by my own product. arcforge.me"

✅ GOOD: "got 'preemptive self-roast' as a signature move and this is extremely my whole life. arcforge.me"

### Banned phrasings

- "which is a personal attack combo" — "combo" is off; "personal attack" alone is correct
- "rude, accurate, very anime" at the end — this is a vibe-check tack-on, not a reaction
- "the archetype was X and the [field] was Y" — field-listing format
- "just tested a sample arc where..." — narrator voice
- "one sample came back as..." — meta voice, not user voice
- Any sentence whose subject is "the archetype" or "the character name" — make the user's reaction the subject instead

### Length

One specific reaction + one supporting detail + URL. If a Discord post is 3+ sentences, it is too long. Cut to the line that hit.

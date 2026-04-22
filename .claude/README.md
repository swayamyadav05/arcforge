# ArcForge Content Agent

A Claude Code slash command that generates cross-platform marketing content (Twitter, LinkedIn, Discord) styled to ArcForge's voice, using real context from your product.

## How it works

Run `/generate` in Claude Code inside this repo. Claude reads all context files, picks a pillar and topic, and generates a single markdown file containing:

- 3 Twitter candidates
- 2 LinkedIn candidates (founder POV, chronological via roadmap)
- 3 Discord candidates (user POV, per server type)

Output lands in `.claude/output/YYYY-MM-DD.md`. You review for 5 minutes, pick favorites, tweak if needed, post.

## Usage

**Auto mode** — picks pillar, picks LinkedIn beat, picks sample arc:
```
/generate
```

**Pillar-specified**:
```
/generate unhinged-outputs
/generate archetype-lore
/generate rate-this-arc
/generate prompt-engineering
/generate feature-tease
```

**LinkedIn beat-specified** (forces a specific roadmap beat):
```
/generate beat-2.1-a
/generate beat-2.3-b
```

**Free-form topic**:
```
/generate phase-2-tease
/generate rate-limiting-bug
/generate launch-reflection
```

## File structure

```
.claude/
  commands/
    generate.md              # the slash command
  context/
    product.md               # what ArcForge is
    pillars.md               # 5 content pillars
    archetypes.md            # archetype lore
    voice/
      twitter.md             # Twitter voice + examples
      linkedin.md            # LinkedIn voice + examples
      discord.md             # Discord voice + examples
    linkedin-roadmap.md      # narrative acts + beats
  arcs/
    sample-01.json ... -06.json   # sample arc outputs
  history/
    posted.md                # what you've posted (manual append)
  output/
    YYYY-MM-DD.md            # daily generated candidates
```

## After posting — the one manual step

After you post one of the generated candidates, append an entry to `.claude/history/posted.md`. This prevents the generator from repeating topics and keeps your LinkedIn narrative chronological.

Template:

```markdown
## 2026-04-21 — Twitter
**Pillar**: unhinged-outputs
**Topic**: Haunted Archivist archetype post with card screenshot
**Link**: https://x.com/you/status/...
**Notes**: 14 likes, 3 replies — card screenshot drove engagement
```

For LinkedIn posts, also check off the beat in `.claude/context/linkedin-roadmap.md` and add a one-line `Next beat` hint to help the next generation.

## Customization

**Add real arcs from your DB**: Drop JSON files into `.claude/arcs/`. Match the structure of existing samples. Real arcs produce better content than fictional ones.

**Adjust voice**: Edit `.claude/context/voice/*.md`. Add more "good" and "bad" examples as you learn what works. The generator weights example files heavily.

**Extend the roadmap**: As Phase 2 and Phase 3 unfold, add beats to `.claude/context/linkedin-roadmap.md`. New acts get added as they become relevant.

**Swap pillars**: Edit `.claude/context/pillars.md`. If a pillar isn't working, replace it with one that does.

## Installation

Copy the entire `.claude/` directory into the root of your ArcForge repo. Commit it. Claude Code picks up custom slash commands automatically from `.claude/commands/`.

```bash
# from your arcforge repo root
cp -r /path/to/this/.claude ./
git add .claude
git commit -m "add content generation agent"
```

Then open Claude Code in the repo and type `/generate`.

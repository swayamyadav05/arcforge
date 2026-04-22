# ArcForge Content Agent — GitHub Copilot Edition

A GitHub Copilot prompt file + scoped instructions that generates cross-platform marketing content (Twitter, LinkedIn, Discord) for ArcForge, using real context from your product.

## How it works

Run `/generate` in GitHub Copilot Chat inside VS Code. Copilot reads the prompt file (`.github/prompts/generate.prompt.md`), which tells it to read all context files, pick a pillar and topic, and write a dated markdown file containing:

- 3 Twitter candidates
- 2 LinkedIn candidates (founder POV, chronological via roadmap)
- 3 Discord candidates (user POV, per server type)

Output lands in `.github/content-context/output/YYYY-MM-DD.md`. You review, pick favorites, tweak, post.

## Prerequisites

1. **VS Code** (stable or Insiders)
2. **GitHub Copilot** subscription (Business, Enterprise, or Pro)
3. **Prompt files enabled** in VS Code settings:

Open `.vscode/settings.json` in your workspace (create if it doesn't exist) and add:

```json
{
  "chat.promptFiles": true,
  "chat.instructionsFilesLocations": {
    ".github/instructions": true
  }
}
```

4. **Copilot Chat in Agent mode** — prompt files with `mode: agent` need Agent mode enabled. Open Copilot Chat, click the mode dropdown, select "Agent."

## Installation

1. Download `arcforge-copilot.zip`
2. Unzip into the root of your ArcForge repo — it'll create `.github/prompts/`, `.github/instructions/`, and `.github/content-context/` alongside your existing files
3. If your repo already has `.github/instructions/` (your AGENTS.md references this), the new `content-generation.instructions.md` file will just be added — it's scoped via `applyTo` and won't conflict with your existing API/OG instructions
4. Commit: `git add .github && git commit -m "add content generation agent"`
5. Reload VS Code window (`Cmd/Ctrl+Shift+P` → "Developer: Reload Window")

## Usage

Open GitHub Copilot Chat. Make sure mode is set to **Agent**. Type:

```
/generate
```

Copilot will prompt you for a topic (the `${input:topic}` variable). You can:

**Leave blank** → auto mode. Picks pillar based on history, picks LinkedIn beat from roadmap.

**Type a pillar name**:
```
/generate
> unhinged-outputs
```
Or: `archetype-lore`, `rate-this-arc`, `prompt-engineering`, `feature-tease`

**Type a LinkedIn beat ID** to force a specific roadmap beat:
```
/generate
> beat-2.1-a
```

**Type a free-form topic**:
```
/generate
> phase-2-tease
```

## File structure

```
.github/
  prompts/
    generate.prompt.md       # the /generate command
  instructions/
    content-generation.instructions.md   # scoped voice/output rules
    (your existing api-routes + og-card instructions stay)
  content-context/
    product.md               # what ArcForge is
    pillars.md               # 5 content pillars
    archetypes.md            # archetype lore
    voice/
      twitter.md             # Twitter voice + examples
      linkedin.md            # LinkedIn voice + examples
      discord.md             # Discord voice + examples
    linkedin-roadmap.md      # narrative acts + beats + angles
    arcs/
      sample-01.json ... -06.json
    history/
      posted.md              # posting log (manual append)
    output/
      YYYY-MM-DD.md          # daily generated candidates
```

Why `.github/content-context/` instead of just a top-level folder? Because:
- Keeps content-generation stuff scoped to the `.github/` area where Copilot looks for instructions
- The scoped instructions file uses `applyTo: ".github/content-context/**"` to activate only when touching these files, so your main codebase isn't affected
- Keeps things organized — context files aren't cluttering the repo root

## After posting — the one manual step

After posting a candidate, append to `.github/content-context/history/posted.md`:

```markdown
## 2026-04-21 — Twitter
**Pillar**: unhinged-outputs
**Topic**: Haunted Archivist archetype with card screenshot
**Link**: https://x.com/you/status/...
**Notes**: 14 likes, 3 replies — card drove engagement
```

For LinkedIn, also check off the beat in `.github/content-context/linkedin-roadmap.md` and add a `Next beat` note.

## Troubleshooting

**`/generate` doesn't appear in the command list**
- Verify `chat.promptFiles` is `true` in VS Code settings
- Reload the window (`Cmd/Ctrl+Shift+P` → "Developer: Reload Window")
- Verify file is at `.github/prompts/generate.prompt.md` exactly

**Copilot generates output but doesn't write a file**
- Mode must be **Agent**, not Ask or Edit. Switch in the Chat mode dropdown.
- Agent mode is required for file writes.

**Generated content is generic / doesn't match ArcForge voice**
- Check the "References" section of Copilot's response. Are all the context files listed?
- If not, Copilot skipped them. Try again with a more explicit prompt ("read all context files first, then generate").
- Add the weak candidate to the "BAD" examples section in the relevant voice file — future runs will learn from it.

**LinkedIn post doesn't follow the roadmap**
- Check that `linkedin-roadmap.md` has the current Act marked clearly
- Explicitly specify a beat ID: `/generate` → `beat-2.3-a`

## Copilot vs Claude Code — honest note

Copilot's prompt files are less deterministic than Claude Code's slash commands. You may need to iterate on the prompt wording if Copilot skips context files or goes off-voice. The scoped instructions in `content-generation.instructions.md` help enforce compliance, but they're guidance, not rules.

If you find Copilot consistently underperforming here, the Claude Code version of this same agent is available as a fallback — install `@anthropic-ai/claude-code` CLI and it runs with higher reliability on multi-file agentic tasks.

## Customization

**Add real arcs**: Drop JSON files into `.github/content-context/arcs/` matching the existing sample structure.

**Adjust voice**: Edit `.github/content-context/voice/*.md`. The example banks are what Copilot calibrates against — add good and bad examples as you learn what works.

**Extend the roadmap**: As Phase 2/3 unfold, add beats to `linkedin-roadmap.md`.

**Swap pillars**: Edit `pillars.md` if a pillar isn't working.

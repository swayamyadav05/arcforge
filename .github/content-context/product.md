# ArcForge — Product Context

## What it is
ArcForge is an AI-powered anime identity platform. Users answer 8 emotionally resonant questions and receive a personalized, serialized anime character arc — archetype, power, backstory, rival, mentor, final form — plus a shareable "Arc Card" image.

**Tagline**: "You are not a viewer. You are the protagonist."

## The problem it solves
Gen Z loves anime (54% globally, 42% weekly) and loves identity content. Existing "which character are you" products are shallow BuzzFeed-era quizzes. ArcForge treats identity seriously — you don't become a character, you get your own arc, with episodes.

## The viral thesis
Every Arc Card IS an ad. Users screenshot and share their cards to TikTok/Twitter/Discord. The product's growth engine is built into the artifact itself — zero paid acquisition by design.

## Current state (as of this file)
- **Phase 1**: Shipped. Anonymous arc generation, Arc Card via `@vercel/og`, 14-17 early users.
- **Phase 2**: In active development. Weekly serialized episodes via subscription + cron.
- **Phase 3**: Future. Merch (Printful), Discord communities, affiliate, brand deals.

## Stack
Next.js 16 App Router, React 19, TypeScript, Neon Postgres + Prisma 7, Claude Sonnet 4.5 via Anthropic SDK, Better Auth (magic links via Resend), PostHog, Sentry, `@vercel/og` for card generation, Vercel hosting, Bun runtime.

## The founder
Solo developer and entrepreneur. Not a marketing person. Building in public. Technical depth is real (architecture decisions around rate limiting, anonymous-first auth, Prisma schema, `@vercel/og` edge rendering). Style: honest, specific, slightly dry, anti-hype.

## Target audience
- **Primary**: Gen Z anime fans (16-24), globally. Active on TikTok, Twitter, Discord.
- **Secondary**: Indie hackers / AI builders watching solo founder journey on Twitter + LinkedIn.
- **Tertiary**: Adjacent anime creative community — fanart Discords, anime subreddits, anime TikTok.

## Positioning vs competitors
- NOT BuzzFeed quizzes (too shallow)
- NOT Character.AI (that's chatbot roleplay, different thing)
- NOT zodiac/MBTI apps (those are static labels — ArcForge gives you a *story*)
- Closest reference: imagine if Spotify Wrapped met an anime personality test and had episodes.

## What "good" looks like for a post
A good ArcForge post does one of three things:
1. Makes someone screenshot it and send to a friend ("this is so YOU")
2. Makes someone curious enough to generate their own arc
3. Makes a fellow builder think "damn, that's a tight execution"

Generic product-announcement posts do none of these. Avoid them.

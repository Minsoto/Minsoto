# Minsoto — Product Vision

*v2.0 · May 2026*

---

## Why

Most writing on the internet is performance.

Substack optimizes for subscribers. Medium optimizes for SEO. Twitter/X optimizes for engagement. Notion is private. Obsidian is local. Substack is too newsletter-brained. Everything wants you to grow an audience.

Minsoto is for the people who want to write publicly without performing.

---

## The two products

### 1. Minimalist Public Journal ("Digital Garden")

Users get a page at `minsoto.com/@handle`. They write short entries — not blog posts, not tweets. Just thinking. Dated, searchable, permanent.

**Design principles:**
- Public by default (the whole point is being findable without a social graph)
- Anonymous by default (only `@handle` is visible unless you opt in to more)
- Markdown supported, but not a rich editor — restraint is the aesthetic
- No likes, no followers, no engagement metrics
- Entries are permanent and dated — a record of thinking over time

**Who it's for:** Developers, researchers, writers, thinkers who want a public presence without the noise.

**The steel-man:** There is a real counter-movement to algorithmic content. People want to write without performing. A calm, beautiful, permanently-accessible space for thinking has genuine pull with the same people who use RSS, have Obsidian vaults, and hate Twitter.

---

### 2. Community Resource Library

A beautifully designed, human-curated directory of tools, links, references, and communities for any niche. No admin-controlled categories — users define their own niche tags, which aggregate organically.

**Design principles:**
- Niche-agnostic — the same product serves indie hackers, competitive programmers, watercolor painters, and language learners
- Human-written descriptions — the honest take, not the SEO-copy from the vendor's site
- Forkable — take any list and make it yours
- Saveable — build a personal collection
- Upvoteable — surface the best resources within a list

**Who it's for:** Anyone who has ever bookmarked 200 tabs, lost the folder, and wished someone had just made a clean list.

---

## What we are not

- Not a social network (no feed, no followers, no algorithm)
- Not a blog platform (no SEO tools, no subscriber growth, no monetization)
- Not a productivity app (gamification is opt-in and personal)
- Not anonymous (you have a handle — you're accountable, just not identified)

---

## Anonymity-first identity model

The platform is anonymous by default, but not anti-identity. The distinction:

| What is always public | What is opt-in |
|---|---|
| `@username` | Display name |
| Journal entries (if visibility = public) | Avatar / profile picture |
| Resource lists (if is_public = true) | Bio |
| | Organization badge |
| | Interests |
| | Connection count |

This is enforced in Settings → Public Identity. Every toggle defaults to off.

---

## Gamification (optional, personal)

XP, streaks, and points remain — but as a personal productivity layer, not a social one.

- Not visible on public journal pages by default
- Never shown in resource library
- Opt-in profile widgets for users who find them motivating
- No leaderboards, no competitive mechanics

---

## North star metric

**Weekly active writers** — people who publish at least one journal entry per week.

Secondary: resource lists created, resources saved.

We explicitly do not track: engagement rate, time on site, follower growth.

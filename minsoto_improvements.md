# Minsoto Improvements & Roadmap

> **Purpose**: A living document tracking identified issues, potential solutions, and strategic direction for Minsoto's development.  
> **Last Updated**: December 15, 2024

---

## Table of Contents
1. [Core Identity & Positioning](#1-core-identity--positioning)
2. [UI/UX Improvements](#2-uiux-improvements)
3. [Feature Prioritization](#3-feature-prioritization)
4. [Technical Debt](#4-technical-debt)
5. [Open Source Strategy](#5-open-source-strategy)
6. [Funding & Sustainability](#6-funding--sustainability)
7. [Community Building](#7-community-building)

---

## 1. Core Identity & Positioning

### Problem: Identity Crisis
Minsoto currently tries to be a habit tracker, task manager, AND social network simultaneously. This creates competition with specialized tools (Todoist, Habitica, LinkedIn) without a clear winning angle.

### The Core Question
> **"Why would someone use Minsoto over Notion + Todoist + any habit tracker?"**

### Potential Positioning Options

| Position | One-liner | Target User | Competitors |
|----------|-----------|-------------|-------------|
| **Social Accountability** | "Build habits with friends who hold you accountable" | People who fail at solo productivity | Habitica, Beeminder |
| **Public Work Profile** | "Your professional productivity portfolio" | Freelancers, job seekers | LinkedIn, Polywork |
| **Mindful Productivity** | "Productivity that respects your mental health" | Burnout-prone professionals | Calm, Headspace (tangential) |
| **Community Learning** | "Learn and grow with your community" | Students, self-improvers | Discord, Notion |

### Recommended Action
- [ ] Conduct 10 user interviews to understand WHY they'd use Minsoto
- [ ] Pick ONE primary position
- [ ] Let other features support that position, not compete with it

### Status: 🟡 Needs Decision

---

## 2. UI/UX Improvements

### 2.1 Onboarding Friction

**Problem**: Users face too many concepts at once (widgets, layouts, connections, habits, goals, Pomodoro).

**Solutions**:
- [ ] Add interactive onboarding tour (3-5 steps max)
- [ ] Create "starter templates" for common use cases
- [ ] Progressive disclosure - unlock features over time
- [ ] "Quick setup" that creates sensible defaults

**Priority**: 🔴 High

---

### 2.2 Empty State Anxiety

**Problem**: Empty widgets and blank profiles feel unwelcoming.

**Solutions**:
- [ ] Add example content with "Replace with your own" CTAs
- [ ] Show inspirational prompts in empty states
- [ ] Pre-populate with 1-2 example habits/tasks for new users
- [ ] Community-shared templates users can import

**Priority**: 🟡 Medium

---

### 2.3 Dashboard vs Profile Confusion

**Problem**: Users may not understand the difference between their private dashboard and public profile.

**Solutions**:
- [ ] Clearer naming (e.g., "My Dashboard" vs "My Public Profile")
- [ ] Visual distinction (different backgrounds/headers)
- [ ] Tooltip or first-visit explanation
- [ ] Consider merging or clarifying the information architecture

**Priority**: 🟡 Medium

---

### 2.4 Mobile Experience

**Problem**: Glassmorphism and complex layouts may struggle on mobile.

**Solutions**:
- [ ] Audit all pages on mobile viewport (375px, 414px)
- [ ] Simplify widget layouts for mobile (single column)
- [ ] Consider mobile-first redesign for core flows
- [ ] Test dark glassmorphism contrast on OLED screens

**Priority**: 🟡 Medium

---

### 2.5 Visual Polish Checklist

| Item | Status | Notes |
|------|--------|-------|
| Loading states for all async operations | 🟡 Partial | Some widgets lack loading states |
| Error states with recovery actions | 🟡 Partial | Added for images, need elsewhere |
| Consistent spacing/typography | 🟢 Good | Design system in place |
| Micro-animations | 🟡 Partial | Framer Motion used, could expand |
| Accessibility (keyboard nav, screen readers) | 🔴 Not audited | Needs full audit |

---

## 3. Feature Prioritization

### Current Feature Matrix

| Feature | Implemented | Polished | Essential for MVP? |
|---------|-------------|----------|-------------------|
| Tasks | ✅ | 🟡 | Yes |
| Habits | ✅ | 🟡 | Yes |
| Goals | ✅ | 🟢 | Yes |
| Pomodoro | ✅ | 🟢 | Nice to have |
| User Status | ✅ | 🟢 | Yes (differentiator) |
| Profile Widgets | ✅ | 🟡 | Yes |
| Connections | ✅ | 🟡 | Yes |
| Communities | 🟡 Partial | 🔴 | Phase 2 |
| Messaging | ❌ | - | Phase 2 |
| Notifications | ❌ | - | Phase 2 |
| Third-party Integrations | ❌ | - | Phase 3 |

### Recommended Priority Order
1. **Polish existing core** (Tasks, Habits, Goals) - reduce bugs, improve UX
2. **Strengthen differentiator** (Status, Social accountability)
3. **Add retention hooks** (Notifications, Streaks, Social activity feed)
4. **Expand social** (Messaging, Communities)
5. **Integrations** (Google Calendar, Todoist import, etc.)

---

## 4. Technical Debt

### Known Issues
- [ ] `@theme` CSS linter warning (Tailwind v4 - false positive, can ignore)
- [ ] Multiple lockfiles causing Next.js workspace warnings
- [ ] Some unused variables (ESLint warnings during build)
- [ ] Dashboard layout was unstable with react-grid-layout (now simplified)

### Performance Considerations
- [ ] Audit bundle sizes (currently ~130KB shared JS)
- [ ] Lazy load widgets not in viewport
- [ ] Consider ISR for public profiles
- [ ] Add caching headers for static assets

### Security Audit Needed
- [ ] Rate limiting on API endpoints
- [ ] Input sanitization (XSS prevention)
- [ ] CORS configuration review
- [ ] JWT token expiry and refresh handling

---

## 5. Open Source Strategy

### Recommended Model: Open Core

| Layer | Open Source | Paid/Premium |
|-------|-------------|--------------|
| Core App | ✅ Tasks, Habits, Goals, Profile | |
| Social Features | ✅ Connections, Status | |
| Advanced Analytics | | 💰 Detailed charts, exports |
| Team/Org Features | | 💰 Shared workspaces |
| Priority Support | | 💰 Email/Discord support |

### Repository Structure
```
minsoto/
├── minsoto-frontend/     # MIT/Apache 2.0
├── minsoto-backend/      # MIT/Apache 2.0
├── docs/                 # Public documentation
├── .github/
│   ├── CONTRIBUTING.md
│   ├── CODE_OF_CONDUCT.md
│   └── ISSUE_TEMPLATE/
└── README.md
```

### Required Files for Open Source Launch
- [ ] LICENSE (Apache 2.0 recommended)
- [ ] CONTRIBUTING.md with setup guide
- [ ] CODE_OF_CONDUCT.md
- [ ] README.md with screenshots and quick start
- [ ] SECURITY.md for vulnerability reporting
- [ ] Good first issues labeled

---

## 6. Funding & Sustainability

### Revenue Streams

| Stream | Effort | Potential |
|--------|--------|-----------|
| **GitHub Sponsors** | Low | $100-500/mo |
| **Open Collective** | Low | $200-1000/mo |
| **Hosted SaaS (minsoto.app)** | Medium | $500-5000/mo |
| **Premium Features** | High | $1000-10000/mo |
| **Grants (NLNet, Mozilla MOSS)** | Medium | $5000-50000 one-time |

### Recommended Approach
1. **Immediate**: GitHub Sponsors + Open Collective
2. **Short-term**: Launch hosted version at minsoto.app ($3-5/user/month)
3. **Medium-term**: Premium features (team features, integrations)
4. **Ongoing**: Apply for open source grants

### Hosting Cost Estimation
| Service | Free Tier | Paid Estimate |
|---------|-----------|---------------|
| Vercel (Frontend) | 100GB bandwidth | $20/mo |
| Railway/Render (Backend) | 500 hours | $20/mo |
| PostgreSQL (Supabase/Neon) | 500MB | $25/mo |
| Total | ~$0 to start | ~$65/mo at scale |

---

## 7. Community Building

### Platforms to Establish
- [ ] Discord server (primary community hub)
- [ ] GitHub Discussions (feature requests, Q&A)
- [ ] Twitter/X account (@minsotoapp)
- [ ] Dev.to / Hashnode blog for updates

### Community Health Metrics to Track
- GitHub stars and forks
- Monthly active contributors
- Issue response time
- Discord member count and activity
- User-submitted feature requests

### First 100 Users Strategy
1. Post on r/selfhosted, r/productivity, r/webdev
2. ProductHunt launch (when polished)
3. Hacker News "Show HN" post
4. Personal network and Twitter threads
5. Reach out to productivity YouTubers/bloggers

---

## Changelog

| Date | Changes |
|------|---------|
| 2024-12-15 | Initial document created with UI/UX feedback, positioning options, and open source strategy |

---

## Next Review Date
**January 15, 2025** - Review progress on high-priority items


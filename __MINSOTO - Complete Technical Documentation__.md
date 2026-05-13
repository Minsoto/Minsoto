# Minsoto — Complete Technical Documentation

*v2.0 · May 2026*

---

## Index

1. [Product Overview](#1-product-overview)
2. [Architecture](#2-architecture)
3. [Backend — Django Apps](#3-backend--django-apps)
4. [Frontend — Next.js App](#4-frontend--nextjs-app)
5. [Database Models](#5-database-models)
6. [API Surface](#6-api-surface)
7. [Auth Flow](#7-auth-flow)
8. [Anonymity Model](#8-anonymity-model)
9. [Security](#9-security)
10. [Deployment](#10-deployment)

---

## 1. Product Overview

Minsoto is a dual-product platform:

**Journal** — `minsoto.com/@handle`
A public, dated, permanent journal page for short thinking. No engagement metrics, no algorithm, no follower count. Anonymous by default.

**Resource Library** — `minsoto.com/resources`
Community-curated directories of tools, links, and references for any niche. Human-described. Forkable. Upvoteable.

**Optional productivity layer** — XP, streaks, habits, goals. Entirely opt-in. Never visible on public pages unless the user enables it.

---

## 2. Architecture

```
┌──────────────────────────────────────────────────────────────┐
│  Frontend (Next.js 14, App Router, TypeScript)               │
│  Deployed: Vercel                                            │
│                                                              │
│  /[username]      → Public journal page                      │
│  /write           → Markdown compose                         │
│  /dashboard       → Writing-first personal dashboard         │
│  /resources       → Browse community resource lists          │
│  /resources/[id]  → List detail, add/upvote/fork             │
│  /settings        → Account + identity opt-in controls       │
└────────────────────┬─────────────────────────────────────────┘
                     │ REST API (JSON, JWT)
┌────────────────────▼─────────────────────────────────────────┐
│  Backend (Django 4, DRF)                                     │
│  Deployed: Render                                            │
│                                                              │
│  apps: users · social · journal · resources                  │
│        productivity · gamification                           │
└────────────────────┬─────────────────────────────────────────┘
                     │ SQLAlchemy / psycopg2
┌────────────────────▼─────────────────────────────────────────┐
│  Database: PostgreSQL (Neon, serverless)                     │
└──────────────────────────────────────────────────────────────┘
```

---

## 3. Backend — Django Apps

### `users`
- Custom `User` model (UUID pk)
- `google_auth` view — verifies Google ID token, issues JWT pair
- `AuthRateThrottle` — 10 requests/hour on auth endpoint
- Username change (once per 30 days enforced in serializer)

### `social`
- `Profile` model — identity fields + 7 anonymity opt-in booleans
- `Organization` + `OrganizationMembership` — email-domain-based org verification
- `Connection` — bidirectional; uniqueness enforced at DB level (LEAST/GREATEST index)
- `Interest` — shared tag model used by Journal and Profile

### `journal` *(new in v2.0)*
- `JournalEntry` — Markdown content, `public`/`draft` visibility, auto-slug, word count
- Public feed API (paginated, no auth required)
- Owner CRUD API (auth required)

### `resources` *(new in v2.0)*
- `ResourceList` — niche-tagged, forkable, community-flagged
- `Resource` — typed (tool/reference/community/tutorial/other), positioned, upvoteable
- `ResourceUpvote` — one per user per resource (DB unique constraint)
- `UserSavedList` — many-to-many save tracking

### `productivity`
- Habits, daily focus, goals — unchanged from v1
- Powers dashboard widgets

### `gamification`
- XP, points, streaks, achievements — unchanged from v1
- Optional profile layer only; no social surface

> **Removed:** `guilds` app is installed but excluded from `INSTALLED_APPS` and all URLs.

---

## 4. Frontend — Next.js App

### State management
- **Zustand** with `persist` middleware (`auth-storage` key)
- `useAuthStore` — `isAuthenticated`, `user`, `accessToken`, `refreshToken`, `_hasHydrated`

### API client (`lib/api.ts`)
- Axios instance with base URL `NEXT_PUBLIC_API_URL`
- Request interceptor: attaches `Authorization: Bearer <token>`
- Response interceptor: auto-refreshes on 401, redirects to `/login` on refresh failure

### Key components
| Component | Purpose |
|---|---|
| `Navigation.tsx` | Fixed nav — shows `@handle` only, routes: Dashboard / Write / Resources / Discover |
| `GoogleAuthButton.tsx` | Google One Tap integration |
| `ProtectedRoute.tsx` | Auth guard wrapper |
| `dashboard/TodaysFocus` | Habits widget |
| `dashboard/StatsWidget` | XP / streak stats |
| `dashboard/GoalsWidget` | Goal tracking |
| `dashboard/PomodoroWidget` | Pomodoro timer |

### Route structure
```
src/app/
├── page.tsx                  → Landing (/ )
├── [username]/page.tsx       → Public journal page
├── write/page.tsx            → Markdown compose
├── dashboard/page.tsx        → Personal dashboard
├── resources/
│   ├── page.tsx              → Browse
│   ├── [id]/page.tsx         → List detail
│   └── new/page.tsx          → Create list
├── settings/page.tsx         → Account + identity
├── login/                    → Google One Tap
├── profile/[username]/       → Redirect → /[username]
├── connections/              → Connection management
├── discover/                 → People discovery
└── rewards/                  → Gamification (demoted, not in nav)
```

---

## 5. Database Models

### Profile (social app)
```python
display_name          CharField(80)     # opt-in display name
show_display_name     BooleanField      # default: False
show_avatar           BooleanField      # default: False
show_bio              BooleanField      # default: False
show_organization     BooleanField      # default: False
show_interests        BooleanField      # default: False
show_connections_count BooleanField     # default: False
bio                   TextField(500)
layout                JSONField         # widget grid config
theme                 CharField         # 'dark' (only option)
```

### JournalEntry (journal app)
```python
author          FK(User)
title           CharField(120, blank)
content         TextField             # Markdown, max 5000 chars enforced in serializer
visibility      CharField             # 'public' | 'draft'
tags            M2M(Interest)
slug            CharField             # YYYY-MM-DD-N, unique per author
word_count      PositiveIntegerField  # auto-computed on save
```

### ResourceList (resources app)
```python
creator         FK(User)
title           CharField(100)
description     TextField(500)
niche_tag       CharField(50)         # free-form; aggregated by /niches/ endpoint
is_public       BooleanField
is_community    BooleanField          # appears in /resources browse
forked_from     FK(self, null)
save_count      PositiveIntegerField  # cached counter
```

### Resource (resources app)
```python
resource_list   FK(ResourceList)
added_by        FK(User)
title           CharField(200)
url             URLField
description     TextField(500)
resource_type   CharField             # tool|reference|community|tutorial|other
is_free         BooleanField
position        PositiveIntegerField
upvote_count    PositiveIntegerField  # cached counter
```

---

## 6. API Surface

See `docs/API_REFERENCE.md` for complete endpoint documentation.

**Base URL:** `/api`

Key endpoint groups:
- `POST /api/auth/google/` — Auth (rate limited 10/hr)
- `GET  /api/journal/<username>/` — Public journal feed
- `POST /api/journal/` — Create entry (auth)
- `GET  /api/resources/` — Browse lists
- `GET  /api/resources/niches/` — All niche tags
- `POST /api/resources/lists/` — Create list (auth)
- `POST /api/resources/lists/<id>/fork/` — Fork (auth)
- `POST /api/resources/items/<id>/upvote/` — Toggle upvote (auth)

---

## 7. Auth Flow

```
1. User clicks Google One Tap on landing / login page
2. Google returns an id_token (JWT signed by Google)
3. Frontend POSTs id_token to POST /api/auth/google/
4. Backend verifies signature via Google's public keys
5. Finds or creates User + Profile
6. Returns access_token (60 min) + refresh_token (7 days)
7. Frontend stores in localStorage + Zustand
8. On 401: auto-refresh via POST /api/auth/token/refresh/
9. Old refresh token blacklisted immediately (token_blacklist app)
10. On refresh failure: redirect to /login
```

First-time users are redirected to `/setup-username/` before accessing the app.

---

## 8. Anonymity Model

The platform is anonymous by default. The public journal page (`/[username]`) shows:

**Always visible:**
- `@username` (the handle — not the real name)
- Journal entries (if `visibility=public`)
- Resource lists (if `is_public=true`)

**Never visible without explicit opt-in:**
- Display name (`show_display_name`)
- Avatar / profile picture (`show_avatar`)
- Bio (`show_bio`)
- Organization badge (`show_organization`)
- Interest tags (`show_interests`)
- Connection count (`show_connections_count`)

All toggles default to `False`. Controlled in Settings → Public Identity.

The Navigation always shows `@username`, never the real name from Google OAuth.

---

## 9. Security

See `docs/SECURITY.md` for full details.

**Summary of v2.0 fixes:**
- `SecurityMiddleware` moved to position 1
- JWT blacklisting enabled (`BLACKLIST_AFTER_ROTATION: True`)
- Google auth rate-limited (10/hr)
- Deprecated `SECURE_BROWSER_XSS_FILTER` removed
- Bidirectional connection DB-level unique index added
- `guilds` removed from URL surface

**Pending manual actions** (credential rotation in Render):
- New `SECRET_KEY`
- Correct `GOOGLE_CLIENT_SECRET`
- Rotated `DATABASE_URL`
- Rotated email password

---

## 10. Deployment

### Backend (Render)
- Runtime: Python 3.11
- Start command: `gunicorn minsoto_backend.wsgi`
- Static files: WhiteNoise
- DB: Neon PostgreSQL (serverless, auto-suspend)
- Environment: all secrets in Render env vars (see `.env.example`)

### Frontend (Vercel)
- Framework preset: Next.js
- `NEXT_PUBLIC_API_URL` → backend Render URL
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID` → Google OAuth client ID

### Migrations
Always run after deploying new backend:
```bash
python manage.py migrate
```

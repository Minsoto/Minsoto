# Minsoto

**A minimalist public journal and community resource library.**

minsoto.com/@yourname — a quiet corner of the internet for thinking out loud.

---

## What it is

Minsoto is two things:

1. **Public journal** — A clean, dated, permanent page for your writing. No algorithm. No engagement metrics. Just entries, in order, readable by anyone. Think digital garden meets static blog, but lighter.

2. **Resource library** — Community-curated directories of tools, references, and links for any niche. Human-written descriptions. Honest. Searchable. Forkable.

Both products are built on a strict **anonymity-first** principle: your public page shows only your `@handle` by default. Every piece of personal information (display name, avatar, bio, org) is opt-in in Settings.

---

## Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router), TypeScript |
| Styling | Vanilla CSS + CSS variables (`globals.css`) |
| State | Zustand (persisted) |
| Backend | Django 4 + Django REST Framework |
| Auth | Google OAuth 2.0 (One Tap) + JWT (SimpleJWT) |
| Database | PostgreSQL (Neon) |
| Deployment | Render (backend), Vercel (frontend) |

---

## Running locally

**Backend**
```bash
cd minsoto-backend
python -m venv venv && source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp ../.env.example .env          # fill in real values
python manage.py migrate
python manage.py runserver
```

**Frontend**
```bash
cd minsoto-frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:3000`, backend on `http://127.0.0.1:8000`.

---

## Environment variables

Copy `.env.example` to `minsoto-backend/.env` and fill in:

| Variable | Where to get it |
|---|---|
| `SECRET_KEY` | Generate with Django's `get_random_secret_key()` |
| `DATABASE_URL` | Neon console → Connection Details |
| `GOOGLE_CLIENT_ID` | Google Cloud Console → APIs & Services → Credentials |
| `GOOGLE_CLIENT_SECRET` | Same page — the **Client Secret**, not the ID |
| `EMAIL_HOST_PASSWORD` | Gmail app password or SMTP provider |

---

## Project structure

```
Minsoto/
├── minsoto-backend/
│   ├── users/           # Auth, user model, Google OAuth
│   ├── social/          # Profile (anonymity fields), Organizations, Connections
│   ├── journal/         # JournalEntry model, public feed API
│   ├── resources/       # ResourceList, Resource, Upvote, Saved APIs
│   ├── productivity/    # Habits, focus, goals
│   └── gamification/   # XP, points, streaks (optional profile layer)
│
├── minsoto-frontend/
│   └── src/app/
│       ├── [username]/  # Public journal page
│       ├── write/       # Markdown compose
│       ├── dashboard/   # Writing-first personal dashboard
│       ├── resources/   # Browse + list detail + create
│       └── settings/    # Identity opt-in controls
│
└── docs/
    ├── PRODUCT_VISION.md
    ├── SECURITY.md
    ├── API_REFERENCE.md
    └── DESIGN_SYSTEM.md
```

---

## Key routes

| URL | Description |
|---|---|
| `/` | Landing page (public) |
| `/[username]` | Public journal page |
| `/write` | Markdown compose (auth required) |
| `/dashboard` | Personal dashboard (auth required) |
| `/resources` | Browse community resource lists |
| `/resources/[id]` | Resource list detail |
| `/resources/new` | Create a new list (auth required) |
| `/settings` | Account + identity settings (auth required) |
| `/profile/[username]` | Redirects to `/[username]` |

---

## Security notes

See `docs/SECURITY.md` for the full security posture. Key points:

- `.env` is gitignored. Use `.env.example` as the template.
- JWT refresh tokens are blacklisted after rotation (`BLACKLIST_AFTER_ROTATION: True`).
- Google auth endpoint is rate-limited to 10 requests/hour.
- `SecurityMiddleware` is correctly positioned first in the middleware stack.
- Bidirectional connection uniqueness is enforced at the DB level (LEAST/GREATEST index).

---

## License

Private — not open source. All rights reserved.

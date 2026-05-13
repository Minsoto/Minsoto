# Minsoto — API Reference

*v2.0 · May 2026 · Base URL: `/api`*

---

## Authentication

All protected endpoints require:
```
Authorization: Bearer <access_token>
```

Access tokens expire in 60 minutes. Refresh via:
```
POST /api/auth/token/refresh/
Body: { "refresh": "<refresh_token>" }
```

---

## Auth

### `POST /api/auth/google/`
Exchange a Google One Tap `credential` (ID token) for Minsoto JWTs.

**Rate limited:** 10 requests/hour (anonymous)

**Request:**
```json
{ "access_token": "<google_id_token>" }
```

**Response:**
```json
{
  "tokens": { "access": "...", "refresh": "..." },
  "user": {
    "id": "uuid",
    "username": "handle",
    "email": "...",
    "first_name": "...",
    "last_name": "...",
    "is_setup_complete": true
  }
}
```

### `POST /api/auth/setup-username/`
Set username after first Google login (required before app access).

---

## User

### `GET /api/user/me/`
Returns the authenticated user object.

### `POST /api/user/username/change/`
Change username (once per 30 days).
```json
{ "username": "new_handle" }
```

### `PATCH /api/profile/update/`
Update profile / identity settings.
```json
{
  "bio": "...",
  "display_name": "Jordan",
  "show_display_name": true,
  "show_avatar": false,
  "show_bio": true,
  "show_organization": false,
  "show_interests": false,
  "show_connections_count": false
}
```

---

## Journal

### `GET /api/journal/<username>/`
Public feed for a user's journal. Returns only `visibility=public` entries.

**Query params:** `offset`, `limit` (max 50)

**Response:**
```json
{
  "count": 12,
  "offset": 0,
  "limit": 20,
  "results": [
    {
      "id": "uuid",
      "author_username": "handle",
      "title": "Optional title",
      "preview": "First 280 chars, markdown stripped",
      "tags": [{ "id": "uuid", "name": "writing" }],
      "slug": "2026-05-11-1",
      "word_count": 142,
      "created_at": "2026-05-11T10:00:00Z"
    }
  ]
}
```

### `GET /api/journal/<username>/<slug>/`
Full single entry (public only).

### `POST /api/journal/` 🔒
Create an entry.
```json
{
  "title": "Optional",
  "content": "Markdown content (max 5000 chars)",
  "visibility": "public",
  "tag_ids": ["uuid"]
}
```

### `GET /api/journal/me/entries/` 🔒
All entries (public + draft) for the authenticated user.

### `GET /api/journal/me/drafts/` 🔒
Drafts only.

### `GET /api/journal/entry/<uuid>/` 🔒
Get a specific entry by UUID (owner only).

### `PATCH /api/journal/entry/<uuid>/` 🔒
Edit an entry (owner only). Partial update.

### `DELETE /api/journal/entry/<uuid>/` 🔒
Delete an entry (owner only).

---

## Resources

### `GET /api/resources/`
Browse public community resource lists.

**Query params:** `niche`, `q` (search), `offset`, `limit`

### `GET /api/resources/niches/`
All niche tags in use, ordered by list count.
```json
[{ "niche": "indie-hacking", "count": 14 }, ...]
```

### `GET /api/resources/lists/<uuid>/`
Get a resource list (with all resources). Private lists require ownership.

### `POST /api/resources/lists/` 🔒
Create a resource list.
```json
{
  "title": "My Toolkit",
  "description": "...",
  "niche_tag": "indie-hacking",
  "is_public": true,
  "is_community": true
}
```

### `PATCH /api/resources/lists/<uuid>/` 🔒
Update a resource list (owner only).

### `DELETE /api/resources/lists/<uuid>/` 🔒
Delete a resource list (owner only).

### `POST /api/resources/lists/<uuid>/fork/` 🔒
Fork a public list. Creates an independent copy under the caller's account.

### `POST /api/resources/lists/<uuid>/save/` 🔒
Save a list to the user's collection.

### `DELETE /api/resources/lists/<uuid>/unsave/` 🔒
Remove from saved.

### `GET /api/resources/my/` 🔒
Returns `{ created: [...], saved: [...] }` for the authenticated user.

### `POST /api/resources/lists/<uuid>/items/` 🔒
Add a resource to a list (owner only).
```json
{
  "title": "Stripe Docs",
  "url": "https://stripe.com/docs",
  "description": "Best API docs in the industry.",
  "resource_type": "reference",
  "is_free": true
}
```
`resource_type` options: `tool`, `reference`, `community`, `tutorial`, `other`

### `PATCH /api/resources/items/<uuid>/` 🔒
Edit a resource item (list owner only).

### `DELETE /api/resources/items/<uuid>/` 🔒
Delete a resource item (list owner only).

### `POST /api/resources/items/<uuid>/upvote/` 🔒
Toggle upvote on a resource. Returns `{ upvoted: bool, upvote_count: int }`.

---

## Social

### `GET /api/profile/<username>/`
Public profile data (respects `show_*` flags — only returns opted-in fields).

### Connections, Organizations
See existing `social/` endpoints — unchanged from v1.

---

## Health

### `GET /api/health/`
Returns `{ status: "ok" }`. No auth required.

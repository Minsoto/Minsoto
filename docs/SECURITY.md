# Minsoto — Security Reference

*v2.0 · May 2026*

---

## Current posture

### ✅ Fixed in v2.0

| Issue | Fix |
|---|---|
| `SecurityMiddleware` was not first in stack | Moved to position 1 in `MIDDLEWARE` |
| JWT refresh tokens not blacklisted after rotation | `BLACKLIST_AFTER_ROTATION: True` + `token_blacklist` app |
| Google auth endpoint had no rate limiting | `AuthRateThrottle` (10/hour) applied |
| `SECURE_BROWSER_XSS_FILTER` deprecated setting | Removed |
| Bidirectional connection constraint only in app logic | DB-level LEAST/GREATEST unique index added |
| `guilds` app still exposed in URLs | Removed from `INSTALLED_APPS` and `urls.py` |

---

### ⚠️ Pending manual actions

These require rotating credentials in external dashboards:

1. **Django `SECRET_KEY`** — Generate a new one:
   ```python
   from django.core.management.utils import get_random_secret_key
   print(get_random_secret_key())
   ```
   Update in: Render → Environment → `SECRET_KEY`

2. **`GOOGLE_CLIENT_SECRET`** — The current value is incorrectly set to the client ID.
   Get the real secret from: [Google Cloud Console](https://console.cloud.google.com) → APIs & Services → Credentials → your OAuth 2.0 client → Client Secret.
   Update in: Render → Environment → `GOOGLE_CLIENT_SECRET`

3. **Neon DB password** — Reset in the [Neon Console](https://console.neon.tech) → your project → Connection Details.
   Update the full `DATABASE_URL` in Render.

4. **Email password** — Update `EMAIL_HOST_PASSWORD` in Render.

5. **Git history** — If `.env` was committed at any point, purge it:
   ```bash
   # Using BFG Repo Cleaner (https://rtyley.github.io/bfg-repo-cleaner/)
   bfg --delete-files .env
   git reflog expire --expire=now --all
   git gc --prune=now --aggressive
   git push --force
   ```

---

## Secrets management rules

- `.env` is gitignored at root level. Never commit it.
- `.env.example` contains no real values — safe to commit as a template.
- All production secrets live exclusively in Render environment variables.
- `DEBUG=False` must be set in production.

---

## Authentication flow

```
User → Google One Tap → id_token (JWT)
     → POST /api/auth/google/ (rate limited: 10/hour)
     → Backend verifies token with Google's public keys
     → Issues: access_token (60 min) + refresh_token (7 days)
     → Refresh: POST /api/auth/token/refresh/
     → Old refresh token is blacklisted immediately (BLACKLIST_AFTER_ROTATION)
```

---

## Django middleware order (correct)

```python
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',  # must be FIRST
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.gzip.GZipMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]
```

---

## Production security headers (active when `DEBUG=False`)

```python
SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
```

---

## Rate limiting

| Endpoint | Limit |
|---|---|
| `POST /api/auth/google/` | 10 requests / hour (anon) |
| All other anon endpoints | DRF default (`DEFAULT_THROTTLE_RATES`) |
| Authenticated endpoints | DRF default |

---

## Known non-issues (by design)

- **No password auth** — Google OAuth only. No password hash to steal.
- **No sensitive PII in JWT payload** — Only user ID and username.
- **Public journal entries are public** — By design. Users choose `visibility=public`.

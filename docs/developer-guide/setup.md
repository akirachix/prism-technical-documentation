---
title: Setup
description: Set up the Mirai backend, frontend and documentation site on a local machine.
---

# Development Setup

<p class="mi-lead">Get the Mirai API, the PWA and this documentation site running locally with synthetic data.</p>


## Prerequisites

| Tool | Version |
| --- | --- |
| Python | 3.12+ |
| Node.js | 20 LTS+ |
| PostgreSQL | 16 (local install or Docker) |
| Git | Recent |
| An authenticator app | Google Authenticator or compatible, for the TOTP step |

## Backend

### 1. Clone and install

```bash
git clone https://github.com/akirachix/prism-backend
cd prism-backend

uv venv
uv pip install -r pyproject.toml --group dev

```

### 2. Create the database

=== "Docker"

    ```bash
    docker run --name mirai-db -e POSTGRES_PASSWORD=postgres \
      -e POSTGRES_DB=mirai -p 5432:5432 -d postgres:16
    ```

=== "Local PostgreSQL"

    ```bash
    psql -U postgres -c "CREATE DATABASE mirai;"
    ```

### 3. Configure environment variables

Create `.env` in the backend root. It is git-ignored; never commit it. Every variable is read by `core/config.py`; the full list is in [Backend → Configuration](../backend/index.md#configuration).

```env
ENVIRONMENT=development
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/mirai
CORS_ORIGINS=http://localhost:3000
FRONTEND_BASE_URL=http://localhost:3000

# First system administrator, created on the first start
ADMIN_EMAIL=sysadmin@example.com
ADMIN_PASSWORD=<choose a temporary password>

# Emails (invitations, resets) are printed to the API log
EMAIL_BACKEND=console

# Optional: AI drafts. Without these, AI jobs finish as FAILED ("not configured")
GEMINI_API_KEY=
GEMINI_MODEL=
FILE_SEARCH_STORE_NAME=
```

In development you can leave `JWT_PRIVATE_KEY`, `JWT_PUBLIC_KEY` and `MFA_ENCRYPTION_KEY` empty: the API generates a temporary RS256 key pair on each start (sign-ins stop working after a restart) and derives the TOTP encryption key from it. Production requires all three ([Deployment](../platform/deployment.md#api-settings-for-production)).

### 4. Migrate and load questions

```bash
uv run --no-sync alembic upgrade head
```

Screening questions and interpretation bands are data. Sign in as the system administrator and upload them as JSON files through Swagger (`/docs`):

- `POST /screening-questions/bulk` with `{"questions": [...]}`
- `POST /screening-interpretations/bulk` with `{"interpretations": [...]}`

The question bank files are not in the repository; ask the team for the current versions. On first start, the API seeds the system administrator from `ADMIN_EMAIL` and `ADMIN_PASSWORD` (`services/user.py`); the first sign-in forces a password change and TOTP setup.

### 5. Run

```bash
uv run --no-sync uvicorn main:app --reload

```

| URL | What |
| --- | --- |
| <http://localhost:8000/docs> | Swagger UI |
| <http://localhost:8000/redoc> | ReDoc |
| <http://localhost:8000/health> | Start-up check, returns `{"status": "ok"}` |

### 6. Test

```bash
uv run --no-sync ruff check .
uv run --no-sync ruff format --check .
uv run --no-sync pytest --cov --cov-report=term-missing
```

## Frontend

```bash
git clone https://github.com/akirachix/prism-frontend.git
cd prism-frontend
npm install
```

Create `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_SCREENING_ENABLED=true
```

Run:

```bash
npm run dev        # http://localhost:3000
npm run build && npm start   # production build, needed to test the service worker
npx prettier --write
npm run lint
npm run test
```

!!! tip "Testing offline behaviour"

    The service worker registers only in production builds (`_components/ServiceWorker.tsx`). In Chrome DevTools, open **Application → Service Workers** and **Network → Offline**: pages you visited load from the cache, others show `offline.html`. Answers are not queued offline yet ([Implementation Status](../reference/implementation-status.md#planned)).

## First walkthrough

With both running and the questions loaded:

1. Sign in as the **system administrator**, set a new password and enrol TOTP.
2. Create a school and its **school administrator**.
3. Sign in as the school administrator and create a **teacher**.
4. Sign in as the teacher, invite a **parent** and register a student aged 6.
5. Open a case and complete the teacher screening.
6. Sign in as the parent (open the invitation link printed in the API log) and complete the parent screening.
7. Calculate the scores (`POST /domain-scores/case/{case_id}/calculate`). If the highest domain score is 2.00 or more, request an IEP draft as the teacher; this needs the Gemini settings.
8. Approve as teacher and school administrator, then sign in as the parent to see the plan and report.

## Documentation site

This repository.

```bash
git clone https://github.com/akirachix/prism-technical-documentation.git
cd prism-technical-documentation

python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt

mkdocs serve             # http://127.0.0.1:8000
mkdocs build --strict    # what CI runs
```

## Troubleshooting

| Problem | Fix |
| --- | --- |
| `401` straight after sign-in | Your system clock is off and TOTP codes fail; sync the clock |
| Locked out after testing | Wait 15 minutes, or reset `failed_login_attempts` and `locked_until` for the user in your local database |
| `409 CASE_ALREADY_OPEN` | The student has an unfinished case; close it or use another student |
| CORS errors in the browser | `FRONTEND_URL` must exactly match the PWA origin |
| Service worker not updating | DevTools → Application → Service Workers → *Update on reload* |
| `mkdocs build --strict` fails | Read the warning: usually a broken link or a page missing from `nav` |

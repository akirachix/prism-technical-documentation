---
title: Setup
description: Set up the Mirai backend, frontend and documentation site on a local machine.
---

# Development Setup

<p class="mi-lead">Get the Mirai API, the PWA and this documentation site running locally with synthetic data.</p>

!!! note "Placeholders"

    Repository URLs and folder names below use placeholders such as `<backend-repo-url>`. Replace them with the real values from the team workspace, and update this page if any command differs from the repository README. <span class="mi-verify">confirm against repos</span>

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
git clone <backend-repo-url> mirai-backend
cd mirai-backend

python3 -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
python -m pip install -r requirements.txt
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

Create `.env` in the backend root. It is git-ignored; never commit it.

```env
ENVIRONMENT=development
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/mirai
FRONTEND_URL=http://localhost:3000

JWT_SECRET_KEY=<generate, see below>
ACCESS_TOKEN_MINUTES=15
REFRESH_TOKEN_HOURS=8

FIELD_ENCRYPTION_KEYS=1:<generate, see below>
ACTIVE_KEY_VERSION=1

SYSTEM_ADMIN_EMAIL=sysadmin@example.com
SYSTEM_ADMIN_TEMP_PASSWORD=<choose a temporary password>

DISCREPANCY_THRESHOLD=1.00

# Optional locally; leave empty to use the mocked AI service
GEMINI_API_KEY=
GEMINI_MODEL=
FILE_SEARCH_STORE_ID=

# Optional locally; leave empty to print emails to the console
RESEND_API_KEY=
RECAPTCHA_SECRET=
```

Generate secrets:

```bash
# JWT signing key
python3 -c "import secrets; print(secrets.token_urlsafe(64))"

# 256-bit field-encryption key (base64)
python3 -c "import os, base64; print(base64.b64encode(os.urandom(32)).decode())"
```

### 4. Migrate and seed

```bash
alembic upgrade head
python -m app.seed --synthetic      # question banks, interpretations, templates, demo school
```

On first start, the API seeds the system administrator from `SYSTEM_ADMIN_EMAIL` and `SYSTEM_ADMIN_TEMP_PASSWORD`. The first sign-in forces a password change and TOTP setup.

### 5. Run

```bash
uvicorn app.main:app --reload --port 8000
```

| URL | What |
| --- | --- |
| <http://localhost:8000/docs> | Swagger UI (development only) |
| <http://localhost:8000/redoc> | ReDoc (development only) |

### 6. Test

```bash
pytest                     # all tests
pytest tests/scoring -q    # golden scoring tests only
bandit -r app -ll          # static security scan
pip-audit                  # dependency vulnerabilities
```

## Frontend

```bash
git clone <frontend-repo-url> mirai-frontend
cd mirai-frontend
npm install
```

Create `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=
NEXT_PUBLIC_AFFILIATION_LABEL=
```

Run:

```bash
npm run dev        # http://localhost:3000
npm run build && npm start   # production build, needed to test the service worker
```

!!! tip "Testing offline behaviour"

    Service workers run only on production builds served over `localhost` or HTTPS. In Chrome DevTools, open **Application → Service Workers** and **Network → Offline** to simulate a dropped connection, answer a few questions, then go back online and watch the queue replay.

## First walkthrough

With both running and the synthetic seed loaded:

1. Sign in as the **system administrator**, set a new password and enrol TOTP.
2. Create a school and its **school administrator**.
3. Sign in as the school administrator and create a **teacher**.
4. Sign in as the teacher, invite a **parent** and register a student aged 6.
5. Open a case and complete the teacher screening.
6. Sign in as the parent (open the invitation link printed in the API console) and complete the parent screening.
7. Check the result: an Elevated or discrepancy result creates an IEP draft (mocked AI locally).
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

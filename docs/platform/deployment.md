---
title: Deployment
description: How the Mirai API, the two web apps and this documentation site are built and released, the settings production requires, and what is still undecided.
---

# Deployment

<p class="mi-lead">What is needed to run Mirai outside a laptop. Everything here comes from the repositories; anything not decided yet is marked and linked to the <a href="../../reference/decision-log/">Decision Log</a>.</p>

## What gets deployed

| Part | Built from | Runs as | Hosting |
| --- | --- | --- | --- |
| Mirai API | `prism-backend` | `uvicorn main:app --host 0.0.0.0 --port $PORT` (`Procfile`, `web`) | Heroku, deployed by `deploy.yml` on push to `main` (backend README). Region open ([Q-10](../reference/decision-log.md#open-questions)) |
| Database migrations | `prism-backend/alembic/` | `alembic upgrade head` before each release (`Procfile`, `release`) | Same as the API |
| PostgreSQL | n/a | Managed PostgreSQL. The API refuses SQLite when `ENVIRONMENT=production` (`database.py`) | Not chosen yet ([Q-10](../reference/decision-log.md#open-questions)) |
| Teacher and parent PWA | `prism-frontend` | `npm run build && npm start` (Next.js) | Not chosen yet ([Q-10](../reference/decision-log.md#open-questions)) |
| Admin dashboard | `prism-dashboard` | `npm run build && npm start` (Next.js) | Not chosen yet ([Q-10](../reference/decision-log.md#open-questions)) |
| This documentation | `prism-technical-documentation` | `mkdocs build`, deployed by `.github/workflows/docs.yml` | GitHub Pages |

The backend README describes the pipeline: `pr-checks.yml` and `ci.yml` (pytest and coverage) run on pull requests; `deploy.yml` re-runs CI on the merged commit, deploys to Heroku and checks `/health`. The workflow files were not in the copy reviewed for these docs.

## API settings for production

The API reads its settings from environment variables (`core/config.py`). With `ENVIRONMENT=production` it refuses to start unless the values marked *Required* are set.

| Variable | Required in production | Purpose |
| --- | --- | --- |
| `ENVIRONMENT` | Set to `production` | Turns on the production checks below, CSP and HSTS headers |
| `DATABASE_URL` | Yes (PostgreSQL) | Database connection |
| `JWT_PRIVATE_KEY`, `JWT_PUBLIC_KEY` | Yes | RS256 signing key pair. Without them, development generates a temporary pair that stops working on restart |
| `MFA_ENCRYPTION_KEY` | Yes | Fernet key that encrypts TOTP secrets |
| `EMAIL_BACKEND` | Must be `smtp` | Email delivery |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USERNAME`, `SMTP_PASSWORD`, `MAIL_FROM` | Yes (with `smtp`) | Outgoing email server |
| `FRONTEND_BASE_URL` | Must start with `https://` | Links in invitation and reset emails |
| `CORS_ORIGINS` | Yes | Comma-separated web app origins allowed to call the API |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | For the first start | Seed the first system administrator |
| `GEMINI_API_KEY`, `GEMINI_MODEL`, `FILE_SEARCH_STORE_NAME` | For AI features | Gemini access, model id and File Search store (`services/ai.py`). The production model is open ([Q-08](../reference/decision-log.md#open-questions)) |
| `AUTO_CREATE_TABLES` | Keep `false` | Use migrations instead |

Never put real values in this repository; set them in the host's secret settings.

## Web app settings

| Variable | App | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | Both | Base URL of the API, for example `https://api.example.org` (no `/api/v1` suffix) |
| `NEXT_PUBLIC_SCREENING_ENABLED` | `prism-frontend` | `true` turns on the screening screens |

## Releasing

1. Merge to `main` in `prism-backend` (pull request, one approving review, PR gate passed).
2. `deploy.yml` re-runs CI and deploys to Heroku. Heroku runs the `release` step (`alembic upgrade head`), then starts the `web` process.
3. The workflow checks `GET /health` returns `{"status": "ok"}`.
4. Update the commit in [Source Code](../reference/source-code.md) and any changed pages.

## Rolling back

No rollback procedure is defined yet. Redeploying the previous commit restores the code, but schema changes do not always reverse: the only migration so far (`alembic/versions/sync_enum_values.py`) has an empty `downgrade`, because PostgreSQL cannot drop enum values. Take a database backup before each release until a procedure exists.

## Not decided yet

| Item | Decision log |
| --- | --- |
| Hosting provider and region (East Africa requested) | [Q-10](../reference/decision-log.md#open-questions) |
| Production Gemini model | [Q-08](../reference/decision-log.md#open-questions) |
| Secret store (Vault is planned; environment variables today) | [Implementation Status](../reference/implementation-status.md#planned) |
| Backups | [Implementation Status](../reference/implementation-status.md#planned) |

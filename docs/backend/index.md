---
title: Backend Overview
description: The Mirai API's stack, module layout, authentication, configuration, background jobs and conventions.
---

# Backend

<p class="mi-lead">The Mirai API is a Python FastAPI service backed by PostgreSQL. It is the only component that touches the database, and it owns every business rule.</p>

## Stack

| Concern | Choice |
| --- | --- |
| Language | Python 3.12 |
| Framework | FastAPI (ASGI), served by Uvicorn |
| Validation | Pydantic models on every request and response |
| ORM and migrations | SQLAlchemy ORM (parameterised queries only), Alembic migrations |
| Database | PostgreSQL |
| Auth | Argon2id (or bcrypt) password hashing, JWT access tokens, refresh token in an `HttpOnly` cookie, TOTP via `pyotp`-style verification |
| AI client | Google Gemini API with File Search (isolated module) |
| Email | Resend / SMTP |
| Testing | Pytest, API tests per endpoint, golden-file scoring tests |
| Security scanning | Bandit, Safety, pip-audit in CI |

## Module layout

The backend is organised so that the scoring engine cannot depend on anything generative, and every route goes through the same auth, scoping and audit helpers.

```text
mirai-backend/
├── alembic/                    # migrations
├── app/
│   ├── main.py                 # app factory, middleware, seeds the system admin
│   ├── core/
│   │   ├── config.py           # settings from environment / Vault
│   │   ├── security.py         # hashing, JWT, TOTP, field encryption
│   │   └── errors.py           # sanitised error handlers
│   ├── deps/
│   │   ├── auth.py             # current_user, require_role(...)
│   │   └── scope.py            # school scoping helpers
│   ├── models/                 # SQLAlchemy tables (see Data Model)
│   ├── schemas/                # Pydantic request / response models
│   ├── routers/                # auth, schools, users, students, cases,
│   │                           # screenings, reports, ieps, evaluations,
│   │                           # recommendations, professionals, audit
│   ├── services/
│   │   ├── workflow.py         # case state machine
│   │   ├── intake_fsm.py       # question sequencing per instrument
│   │   ├── reports.py          # deterministic report builder
│   │   ├── audit.py            # single append-only writer
│   │   └── notifications.py
│   ├── scoring/                # pure functions, NO AI imports
│   │   ├── instruments.py      # instrument interface + registry
│   │   ├── age_gate.py
│   │   ├── domain_score.py
│   │   └── discrepancy.py
│   ├── ai/                     # Gemini File Search client, prompts, guards
│   └── jobs/                   # scheduled tasks
└── tests/
```

!!! note "Status of this layout"

    This is the agreed target structure derived from the Technical Requirements and the feature implementation notes. Keep this page in sync with the backend repository as it evolves. <span class="mi-verify">confirm against repo</span>

## Functional modules

Each module in the [functional architecture](../architecture/index.md#functional-architecture) maps to a router and a service.

| Module | Responsibility | Main tables |
| --- | --- | --- |
| School management | Create schools, school admins, teachers; revoke staff; school profile | `school`, `user` |
| Assessment | Open cases, serve questions, accept answers, lock the window | `case`, `screening_*` |
| Scoring | Domain scores, levels, discrepancy, case outcome | `domain_score`, `case` |
| Report generation | Build and rebuild the per-case report | `report`, `screening_interpretation` |
| Parent recommendations | Home activities and professional directory | `recommendation`, `recommendation_template`, `professional` |
| IEP | Draft (AI or manual), edit, submit, regenerate | `iep` |
| IEP approval | Teacher and school admin approval or rejection | `iep`, `case` |
| Evaluation | Generate questions, unlock after six weeks, collect answers | `iep_evaluation_question`, `evaluation_response` |
| Audit | Write and read audit events | `audit_log` |

## Authentication and sessions

| Rule | Value |
| --- | --- |
| Account creation | Top-down only: system admin creates school admins, school admins create teachers, teachers create parents. No public sign-up. |
| First sign-in | Forces a password change and Google Authenticator enrolment for staff |
| Second factor | 6-digit TOTP; each time-step accepted once (`last_totp_step`) |
| Lockout | 5 failed attempts lock the account for 15 minutes |
| Access token | Short-lived JWT with `jti`, `role`, `school_id`, `token_version` |
| Refresh token | `HttpOnly`, `Secure`, `SameSite=Strict` cookie |
| Idle timeout | 15 minutes for staff, 30 minutes for parents; forms autosave to the server |
| Absolute timeout | 8 hours for staff |
| Sign-out and revocation | `jti` added to `revoked_token`; raising `token_version` ends every older session |
| School deactivation | `school.is_active = false` blocks sign-in for every user of that school |

## Authorisation pattern

Every protected route declares its allowed roles with a reusable dependency, and every query is filtered by the caller's school.

```python
@router.get("/cases/{case_id}")
def get_case(
    case_id: UUID,
    user: User = Depends(require_role(Role.TEACHER, Role.PARENT)),
    db: Session = Depends(get_db),
):
    case = cases.get_scoped(db, case_id, user)   # raises 404 if not visible to user
    audit.write(db, user, AuditAction.VIEW, "Case", case.case_id)
    return CaseOut.from_orm_for(user, case)      # role-specific projection
```

Rules that every handler follows:

- **Return 404, not 403, for records outside the caller's scope**, so IDs cannot be probed.
- **Never trust IDs from the client** for ownership: resolve the student, then check `teacher_id` or `parent_id` against the caller.
- **Use role-specific response models**, so a school admin projection physically has no field for raw answers.
- **Write one audit event per sensitive action** through `services/audit.py`.

## Configuration

Settings are read from environment variables, which in staging and production are injected from HashiCorp Vault at runtime. Nothing secret is committed.

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET_KEY` | Signing key for access tokens |
| `ACCESS_TOKEN_MINUTES`, `REFRESH_TOKEN_HOURS` | Token lifetimes |
| `FIELD_ENCRYPTION_KEYS` | Versioned keys for application-layer encryption |
| `ACTIVE_KEY_VERSION` | Key version used for new writes |
| `GEMINI_API_KEY` | Gemini API access |
| `GEMINI_MODEL` | Model id, for example `gemini-3.5-flash` <span class="mi-verify">confirm</span> |
| `FILE_SEARCH_STORE_ID` | KICD and activity-bank File Search Store |
| `RESEND_API_KEY` or `SMTP_*` | Outbound email |
| `RECAPTCHA_SECRET` | Server-side reCAPTCHA verification |
| `FRONTEND_URL` | Allowed CORS origin and link base for invitations |
| `SYSTEM_ADMIN_EMAIL`, `SYSTEM_ADMIN_TEMP_PASSWORD` | Seed for the first system administrator |
| `DISCREPANCY_THRESHOLD` | Cross-informant variance threshold (interim 1.00) |
| `ENVIRONMENT` | `development`, `staging` or `production` (disables docs and debug in production) |

## Background jobs

| Job | Schedule | What it does |
| --- | --- | --- |
| Close intake windows | Every 15 minutes | Locks responses of cases whose 7-day window has passed |
| Unlock evaluations | Hourly (or on read) | Moves `IEP_ACTIVE` to `EVALUATION_PENDING` when `evaluation_unlock_date` arrives and notifies teacher and parent |
| Clean revoked tokens | At start-up | Deletes `revoked_token` rows past `expires_at` |
| Termly cleanup | Nightly | Applies the [retention schedule](../security/privacy-compliance.md#data-retention) |
| Report retries | On failure, with backoff | Re-runs failed report builds idempotently |

## Errors

All errors return a sanitised JSON body. Stack traces, SQL errors, file paths and environment values are logged server-side only.

| Status | When |
| --- | --- |
| `400` | Business rule violation (for example the intake window has closed) |
| `401` | Not signed in, token expired or revoked |
| `403` | Signed in but the role is not allowed this action |
| `404` | Not found, or outside the caller's scope |
| `409` | Conflict (for example the student already has an unfinished case) |
| `422` | Invalid input (Pydantic validation) |
| `429` | Too many requests |

```json
{ "error": { "code": "CASE_ALREADY_OPEN", "message": "This student already has an open case." } }
```

## In this section

- [Screening and Scoring Engine](scoring-engine.md): age gating, intake state machine, formulas and discrepancy
- [API Reference](api.md): endpoint groups, roles and contracts

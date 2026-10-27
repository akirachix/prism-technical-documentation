---
title: Traceability
description: Each important claim in this documentation, mapped to the code or test that proves it.
---

# Traceability

<p class="mi-lead">Where to check each important claim. Paths are relative to the repository named in the first column. Claims about features that are not built yet are on <a href="../implementation-status/">Implementation Status</a> instead.</p>

## Authentication and sessions

| Claim | Repository | Evidence |
| --- | --- | --- |
| Sign-in is staged: password, forced change, TOTP enrolment, TOTP verification | backend | `services/auth.py` (`_stage_for`), `routers/auth.py`; `tests/test_auth.py` |
| Every role, parents included, uses TOTP as the second factor | backend | `services/auth.py` (`_stage_for` has no role branch) |
| Tokens are RS256 JWTs with a scope, `jti`, issuer and audience | backend | `core/security.py` (`create_token`, `decode_token`); `tests/test_security.py` |
| Revoked tokens and old token versions are rejected | backend | `services/auth.py` (`is_token_revoked`, `token_version` check) |
| Passwords are hashed with Argon2 | backend | `core/security.py` (`PasswordHasher`); `tests/test_security.py` |
| 5 failed attempts lock an account for 15 minutes | backend | `core/config.py` (`max_failed_logins`, `lockout_minutes`), `services/auth.py` |
| A TOTP code is accepted once per time-step | backend | `core/security.py` (`verify_totp`, `last_used_step`) |
| Sign-in, MFA, refresh and reset are rate limited | backend | `routers/auth.py` (`@limiter.limit`), `core/rate_limit.py` |
| The web apps send the access token as a bearer header and refresh once on `401` | frontend | `lib/api.ts` (`request`, `refreshSession`) |

## Authorisation

| Claim | Repository | Evidence |
| --- | --- | --- |
| Role guards are FastAPI dependencies | backend | `dependencies.py` (`require_roles`) |
| Which routes have a guard and which do not | backend | [Endpoint List](../backend/api-endpoints.md), generated from `routers/*.py` |
| A parent can read only their own child's case | backend | `services/case.py` (`_parent_owns`); `tests/test_parent_access.py` |
| Web portals redirect users of the wrong role | frontend | `_components/RequireRole.tsx`; dashboard: `components/auth/AuthGuard.tsx` |

## Screening, scoring and reports

| Claim | Repository | Evidence |
| --- | --- | --- |
| Scoring is deterministic and uses no AI | backend | `services/screening_rules.py`, `services/domain_score.py`; `tests/test_screening_rules.py`, `tests/test_domain_score.py` |
| Scores are scaled 0.00 to 3.00 and rounded half-up to two decimals | backend | `services/screening_rules.py` (`density`, `combine`, `SCALE_TOP`) |
| Teacher and parent scores are averaged per domain | backend | `services/screening_rules.py` (`combine`) |
| Instruments depend on age (SNAP-IV from 5, ADHD-RS Preschool below 5, dyslexia from 6) | backend | `services/screening_rules.py` (`tool_for_domain`, `anchor_applies`) |
| A student can have only one open case | backend | `models/case.py` (`uq_case_one_open_per_student`); `tests/test_case.py` |
| The parent report is built from scores without AI and carries the non-diagnosis disclaimer | backend | `services/report_builder.py`; `tests/test_report.py` |

## AI

| Claim | Repository | Evidence |
| --- | --- | --- |
| AI drafts run as background jobs and are polled | backend | `routers/ai.py`, `services/ai.py` (`run_job`); `tests/test_ai.py` |
| Drafts are grounded in a Gemini File Search store and saved only with at least one reference | backend | `services/ai.py` (`GeminiProvider._run`, `_with_evidence`) |
| Output containing a personal name is rejected | backend | `services/ai.py` (`assert_no_names`); `tests/test_ai.py` |
| The model is chosen by the `GEMINI_MODEL` environment variable | backend | `services/ai.py` |
| An IEP is active only after teacher and school administrator approval | backend | `services/iep.py`; `tests/test_iep.py` |

## Data and audit

| Claim | Repository | Evidence |
| --- | --- | --- |
| Primary keys are UUIDs | backend | `models/*.py` |
| Audit rows cannot be updated or deleted through the application | backend | `models/audit_log.py` (`before_update`, `before_delete`); `tests/test_audit_log.py` |
| Parent consent is recorded when an invitation is accepted | backend | `services/student.py` (`resource_type="parent_consent"`); `tests/test_parent_invitation.py` |
| Schema changes are migrations | backend | `alembic/versions/`; `tests/test_migrations.py` |

## Platform

| Claim | Repository | Evidence |
| --- | --- | --- |
| The API runs with Uvicorn and applies migrations on release | backend | `Procfile` |
| Health check at `GET /health` | backend | `main.py`; `tests/test_health.py` |
| This site is built with `mkdocs build --strict` on every push and pull request | docs | `.github/workflows/docs.yml` |

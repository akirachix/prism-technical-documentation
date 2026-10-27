---
title: Implementation Status
description: What Mirai implements today, what is partly built, what is planned, and the security gaps still open in the code.
---

# Implementation Status

<p class="mi-lead">Other pages describe the system Mirai is designed to be. This page says which parts exist in the code today, so a reader can tell design from implementation. Evidence paths point into the repositories listed in <a href="../source-code/">Source Code</a>.</p>

| Status | Meaning |
| --- | --- |
| **Implemented** | In the code, with the file that proves it |
| **Partial** | Some of it is in the code; the gap is stated |
| **Planned** | Documented design; not in the code yet |

## Implemented

| Feature | Evidence |
| --- | --- |
| Staged sign-in: password, forced password change, TOTP enrolment and verification for every role | `prism-backend/services/auth.py`, `routers/auth.py` |
| RS256 access, refresh and step tokens with scopes, `jti` revocation and `token_version` | `prism-backend/core/security.py`, `services/auth.py` |
| Argon2 password hashing, lockout after 5 failed attempts for 15 minutes | `prism-backend/core/security.py`, `core/config.py` |
| TOTP secrets encrypted at rest (Fernet) and each time-step accepted once | `prism-backend/core/security.py` (`encrypt_secret`, `verify_totp`) |
| Rate limits on sign-in, MFA, refresh, password reset and parent invitations | `prism-backend/routers/auth.py`, `routers/student.py` |
| Security headers on every response; CSP and HSTS in production | `prism-backend/main.py` |
| Role guards for routes that use them | `prism-backend/dependencies.py` (`require_roles`) |
| One open case per student | `prism-backend/models/case.py` (`uq_case_one_open_per_student`) |
| Deterministic, age-gated screening rules and scoring | `prism-backend/services/screening_rules.py`, `services/domain_score.py`, `tests/test_screening_rules.py` |
| Report built from scores without AI | `prism-backend/services/report_builder.py` |
| AI drafts (IEP, recommendation, evaluation questions) as background jobs, grounded in File Search, with personal names rejected | `prism-backend/services/ai.py`, `routers/ai.py`, `ai/guard.py` |
| Dual approval of IEPs; six-week evaluation unlock date set on approval | `prism-backend/services/iep.py` |
| Audit log table that cannot be updated or deleted through the ORM | `prism-backend/models/audit_log.py` |
| Parent invitation with consent statements recorded in the audit log | `prism-backend/services/student.py` |
| Database migrations | `prism-backend/alembic/` |
| Installable PWA with an offline fallback page | `prism-frontend/app/manifest.ts`, `public/sw.js`, `public/offline.html` |

## Partial

| Feature | What exists | What is missing |
| --- | --- | --- |
| Audit logging | Consent and invitation resends write `audit_log` rows; other auth events are written to the application log by `services/audit.py` | Rows for every create, view of child data, approval, generation and export |
| Session handling | Short-lived access tokens with refresh rotation | `HttpOnly` cookies (tokens are kept in browser storage: `prism-frontend/lib/session.ts`), idle and absolute timeouts |
| Background work | Expired-token purge at start-up; AI jobs via FastAPI `BackgroundTasks` | Scheduled jobs for intake-window closing, evaluation notifications and retention cleanup |
| Consent | Consent recorded when a parent accepts an invitation | A consent table and withdrawal behaviour ([Q-04](decision-log.md#open-questions)) |
| Scoring isolation from AI | `services/screening_rules.py` imports no AI client | A test that fails if it ever does |
| Server-side scoring used by the web app | The API scores both screenings (`POST /domain-scores/case/{case_id}/calculate`) | The teacher and parent PWA still scores answers in the browser (`prism-frontend/lib/scoring.ts`, `lib/screening.ts`), saves them as report content and sets case scores with `PATCH /cases/{case_id}`. Its levels (`LOW`/`MEDIUM`/`ELEVATED`, higher of the two scores) differ from the API's (`LOW`/`MODERATE`/`HIGH`, average). Behind `NEXT_PUBLIC_SCREENING_ENABLED` |

## Planned

| Feature | Where it is described |
| --- | --- |
| Discrepancy rule: a large teacher–parent gap treated like an Elevated result ([D-04](decision-log.md#decisions)) | [Scoring Engine](../backend/scoring-engine.md#bands-and-the-case-outcome) |
| Score gate before AI generation, regeneration limit and cooldown ([D-09](decision-log.md#decisions)), teacher quality rating | [IEP Generation](../ai/iep-generation.md#when-generation-is-allowed) |
| 7-day intake window | [Case Lifecycle](../architecture/case-lifecycle.md) |
| Automatic case statuses after scoring (`IEP_PENDING_APPROVAL`, `IEP_ACTIVE`, `EVALUATION_PENDING`, `COMPLETED`) | [Case Lifecycle](../architecture/case-lifecycle.md#transitions-and-guards) |
| Condition-word check on IEP text | [AI](../ai/index.md) |
| Application-layer encryption of child name, date of birth and parent contacts (`BYTEA` + `key_version`). Today only the TOTP secret is encrypted | [Security](../security/index.md#encryption), [Data Model](../architecture/data-model.md) |
| HashiCorp Vault for secrets. Today settings come from environment variables | [Platform](../platform/index.md) |
| Encrypted backups on Supabase | [Platform](../platform/index.md) |
| reCAPTCHA v3 on sign-in | [Security](../security/index.md) |
| DNS/DDoS protection and a WAF in front of the API | [Architecture](../architecture/index.md) |
| Offline answer queue with idempotency keys. Today the service worker caches pages and static files only | [Frontend](../frontend/index.md#offline-behaviour) |
| Referral packet export | [Data Model](../architecture/data-model.md) |
| Longitudinal record per child | [Data Model](../architecture/data-model.md) |

## Security gaps

These are gaps in the **code**, found while checking the documentation against it. They are listed here so the documentation does not claim protections that do not exist yet. Fix them in `prism-backend` and update this table.

| Gap | Evidence | Fix |
| --- | --- | --- |
| 45 routes accept requests without an access token, including reading reports, saving screening answers, calculating scores, approving IEPs and managing professionals | [Endpoint List](../backend/api-endpoints.md) (rows marked **None**) | Add `Depends(get_current_user)` or a `require_roles(...)` guard to each route, and a role and school check in the service |
| `GET /reports/case/{case_id}` returns a child's report to any caller who knows the case id | `prism-backend/routers/report.py` | Restrict to the child's parent (and, if decided, the school administrator; see [Q-06](decision-log.md#open-questions)) |
| `POST /ieps/{iep_id}/approve` and `/reject` have no caller check, and the approver's id comes from the request body | `prism-backend/routers/iep.py`, `services/iep.py` (`payload.approved_by`) | Take the approver from the access token; require the initiating teacher or a school administrator of the same school |

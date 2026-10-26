---
title: API Reference
description: Mirai API endpoint groups, the roles allowed on each, and example contracts.
---

# API Reference

<p class="mi-lead">All endpoints live under <code>/api/v1</code>, accept and return JSON, and require a valid access token unless marked public.</p>


## Conventions

| Convention | Rule |
| --- | --- |
| Base path | `/api/v1` |
| IDs | UUIDs in paths; never sequential numbers |
| Auth | `Authorization: Bearer <access token>`; refresh token in an `HttpOnly` cookie |
| Scope | Records outside the caller's school or relationship return `404` |
| Pagination | `?page=1&page_size=20` on list endpoints |
| Idempotency | `Idempotency-Key` header on answer submissions so offline replays never duplicate |
| Errors | `{ "error": { "code": "...", "message": "..." } }` with `400`, `401`, `403`, `404`, `409`, `422`, `429` |
| Audit | Every create, view of child data, submit, approve, reject, generate and export writes an audit row |

Role abbreviations: **SYS** system administrator, **SA** school administrator, **T** teacher, **P** parent.

## Authentication

| Method | Path | Roles | Description |
| --- | --- | --- | --- |
| `POST` | `/auth/login` | Public | Email, password and reCAPTCHA token. Returns an MFA challenge or a first-sign-in requirement |
| `POST` | `/auth/mfa/setup` | Any (first sign-in) | Returns the TOTP provisioning URI for Google Authenticator |
| `POST` | `/auth/mfa/verify` | Any | Verifies the 6-digit code; issues tokens |
| `POST` | `/auth/password/change` | Any | Changes password; raises `token_version` |
| `POST` | `/auth/password/forgot` | Public | Sends a single-use reset link by email |
| `POST` | `/auth/password/reset` | Public (token) | Sets a new password from a reset token |
| `POST` | `/auth/refresh` | Any (cookie) | Rotates the access token; old `jti` revoked |
| `POST` | `/auth/logout` | Any | Revokes the current token |
| `GET` | `/auth/me` | Any | Current user, role and school |
| `POST` | `/invitations/{token}/accept` | Public (token) | Parent or staff accepts an invitation and sets a password |

## Schools and staff

| Method | Path | Roles | Description |
| --- | --- | --- | --- |
| `POST` | `/schools` | SYS | Create a school with its first school administrator |
| `GET` | `/schools` | SYS | List schools with onboarding status |
| `GET` | `/schools/{school_id}` | SYS, SA (own) | School profile, classes and counts |
| `PATCH` | `/schools/{school_id}` | SYS, SA (own) | Update profile; SYS can deactivate |
| `POST` | `/schools/{school_id}/teachers` | SA | Create a teacher account with a temporary password |
| `GET` | `/schools/{school_id}/teachers` | SA | List teachers and their pending approvals |
| `PATCH` | `/users/{user_id}/revoke` | SA (own school), SYS | Revoke staff access; ends sessions |
| `POST` | `/parents` | T | Invite a parent (name, email, phone) |
| `POST` | `/parents/{user_id}/resend-invite` | T | Resend an expired invitation |

## Students and cases

| Method | Path | Roles | Description |
| --- | --- | --- | --- |
| `POST` | `/students` | T | Register a student (name, date of birth, gender, admission number, parent) |
| `GET` | `/students` | T (own class), P (own children) | List students with their current case status |
| `GET` | `/students/{student_id}` | T, P | Student and journey summary |
| `GET` | `/students/{student_id}/history` | T (any current teacher at the school) | Longitudinal record of past cases |
| `POST` | `/students/{student_id}/cases` | T | Open a case; routes instruments by age; `409` if one is unfinished |
| `GET` | `/cases` | T, SA | Cases in scope, filterable by status |
| `GET` | `/cases/{case_id}` | T, P, SA | Case status and timeline (role-specific projection) |
| `POST` | `/cases/{case_id}/close` | T | Close early with `reason` and optional note |

## Screening

| Method | Path | Roles | Description |
| --- | --- | --- | --- |
| `POST` | `/cases/{case_id}/assessments` | T, P | Start or resume the caller's assessment |
| `GET` | `/assessments/{assessment_id}/next` | T, P (own) | Next question from the state machine |
| `PUT` | `/assessments/{assessment_id}/responses/{question_id}` | T, P (own) | Save one answer (`Idempotency-Key` required) |
| `POST` | `/assessments/{assessment_id}/submit` | T, P (own) | Submit; when both are done, scoring runs |
| `GET` | `/cases/{case_id}/scores` | T, SA (while approving) | Three domain scores and levels, no raw answers |

## Reports, recommendations and referral

| Method | Path | Roles | Description |
| --- | --- | --- | --- |
| `GET` | `/cases/{case_id}/report` | P (own child) | Report content: disclaimer, domain bands with meaning, recommendation, active IEP, professionals |
| `POST` | `/cases/{case_id}/report/regenerate` | System / SYS | Rebuild in place (upsert on `case_id`) |
| `GET` | `/cases/{case_id}/recommendation` | P | Home activities and guidance |
| `POST` | `/cases/{case_id}/referral-packet/export` | **P only** | De-identified, encrypted PDF; audited as `EXPORT` |
| `GET` | `/professionals` | P, T | Active professionals; filter by `specialty` and `location` |
| `POST` | `/professionals` | SYS | Add a professional |
| `PATCH` | `/professionals/{professional_id}` | SYS | Edit or deactivate |

## IEP

| Method | Path | Roles | Description |
| --- | --- | --- | --- |
| `POST` | `/cases/{case_id}/ieps/generate` | T | Generate a draft; `400` unless Elevated or discrepancy; `429` when regeneration limit reached |
| `POST` | `/cases/{case_id}/ieps` | T | Create a manual version (`generated_by = MANUAL`) |
| `GET` | `/cases/{case_id}/ieps` | T, SA, P (active only) | Versions for the case |
| `GET` | `/ieps/{iep_id}` | T, SA, P (active only) | One version |
| `PATCH` | `/ieps/{iep_id}` | T (initiating teacher, `DRAFT` only) | Edit content, goals and strategies |
| `POST` | `/ieps/{iep_id}/submit` | T | Move to `PENDING_APPROVAL` |
| `POST` | `/ieps/{iep_id}/approve` | T, SA (same school) | Record approval; both make it `ACTIVE` |
| `POST` | `/ieps/{iep_id}/reject` | T, SA | Reject with a required `reason` |
| `POST` | `/ieps/{iep_id}/rating` | T | Rate draft quality 1 to 5 (feeds the AI quality metric) |

## Evaluation

| Method | Path | Roles | Description |
| --- | --- | --- | --- |
| `GET` | `/cases/{case_id}/evaluation` | T, P | Questions once unlocked, or the unlock date and progress |
| `PUT` | `/evaluation-questions/{eval_question_id}/response` | T, P | Score `-2` to `2`; one answer per role |
| `POST` | `/cases/{case_id}/evaluation/submit` | T, P | Finish; case `COMPLETED` when both are done |

## Notifications, metrics and audit

| Method | Path | Roles | Description |
| --- | --- | --- | --- |
| `GET` | `/notifications` | Any | Caller's notifications |
| `POST` | `/notifications/{notification_id}/read` | Any | Mark as read |
| `GET` | `/metrics/school` | SA | Aggregate counts for the school (no child identities) |
| `GET` | `/metrics/platform` | SYS | Students screened, schools and experts onboarded, AI output quality |
| `GET` | `/audit-logs` | SA (own school), SYS | Filter by action, actor and date range |

## Example contracts

=== "Open a case"

    ```http
    POST /api/v1/students/0b6c.../cases
    Authorization: Bearer eyJ...
    ```

    ```json
    {
      "case_id": "7f3e9a2c-1d4b-4c55-9b0e-2b0f5d1f8a10",
      "status": "INITIATED",
      "age_band": "6-9",
      "instruments": ["CAST", "SNAP_IV", "CLDQR"],
      "window_closes_at": "2026-10-31T23:59:59Z"
    }
    ```

    `409 CASE_ALREADY_OPEN` if the student has an unfinished case. `403` if the caller is not the student's teacher.

=== "Save an answer"

    ```http
    PUT /api/v1/assessments/5a1d.../responses/9c2e...
    Authorization: Bearer eyJ...
    Idempotency-Key: 1c9f6f0e-6a7d-4d8f-9a55-6a1c2b3d4e5f
    Content-Type: application/json

    { "selected_value": 2 }
    ```

    ```json
    { "saved": true, "next_question_id": "e41b...", "progress": { "part": 2, "of_parts": 3, "question": 8, "of_questions": 24 } }
    ```

=== "Scores (school admin view)"

    ```json
    {
      "case_id": "7f3e9a2c-1d4b-4c55-9b0e-2b0f5d1f8a10",
      "domains": [
        { "domain": "AUTISM",   "combined_score": 0.62, "level": "LOW" },
        { "domain": "ADHD",     "combined_score": 1.56, "level": "MODERATE", "discrepancy": true },
        { "domain": "DYSLEXIA", "combined_score": 0.95, "level": "LOW" }
      ],
      "overall": "ELEVATED_PATHWAY"
    }
    ```

    No raw answers, no teacher or parent breakdown, no names.

=== "Approve an IEP"

    ```http
    POST /api/v1/ieps/3d7a.../approve
    Authorization: Bearer eyJ...
    ```

    ```json
    {
      "iep_id": "3d7a...",
      "status": "ACTIVE",
      "teacher_approved": true,
      "admin_approved": true,
      "approved_at": "2026-10-03T09:12:44Z",
      "evaluation_unlock_date": "2026-11-14T09:12:44Z"
    }
    ```

---
title: System Context
description: Mirai's actors, trust boundaries, external integrations and the main request flows.
---

# System Context

<p class="mi-lead">Who and what Mirai talks to, where the trust boundaries are, and what crosses them.</p>

## Context diagram

```mermaid
flowchart TB
    subgraph People
        T[Teacher]
        P[Parent / caregiver]
        SA[School administrator]
        SYS[System administrator]
    end

    subgraph Mirai["Mirai platform"]
        PWA[Teacher and parent PWA<br/>prism-frontend]
        DASH[Admin dashboard<br/>prism-dashboard]
        API[Mirai API<br/>FastAPI]
        DB[(PostgreSQL)]
        PWA <-->|HTTPS + JWT| API
        DASH <-->|HTTPS + JWT| API
        API <--> DB
    end

    subgraph Third["Third-party services"]
        GEM[Gemini API +<br/>File Search Store]
        MAIL[SMTP]
        GA[Authenticator app<br/>TOTP]
    end

    PRO[Psychologist / psychiatrist<br/>KISE / EARC]

    T --> PWA
    P --> PWA
    SA --> DASH
    SYS --> DASH
    API -->|de-identified prompt| GEM
    API -->|invites, codes| MAIL
    API -.->|verify code server-side| GA
    P -.->|parent shares the report<br/>outside Mirai| PRO
```

The dashed line to professionals is deliberate: **Mirai never sends anything to a clinic**. The parent decides who to share their child's report with. reCAPTCHA, Vault and Supabase backups are *planned* and not shown ([Implementation Status](../reference/implementation-status.md#planned)).

## Actors

| Actor | Channel | Trust level | Notes |
| --- | --- | --- | --- |
| Teacher | PWA (mobile-first) | Authenticated staff, MFA | Created by their school administrator; scoped to students in their class |
| Parent / caregiver | PWA from an invitation link | Authenticated, bound to their own child | Created by the teacher; no access to other children or institutional data |
| School administrator | PWA (desktop-first) | Authenticated staff, MFA | Created by the system administrator; scoped to one school |
| System administrator | PWA admin console | Highest privilege, MFA | Seeded at start-up; no school; admin screens never show child content |
| Receiving professional | None (offline) | Outside the system | Only sees a packet a parent chose to export |

## Trust boundaries

```mermaid
flowchart LR
    subgraph B0["Untrusted: internet"]
        U[Browser / device]
    end
    subgraph B1["Edge"]
        WAF[DNS, DDoS, WAF,<br/>API gateway]
    end
    subgraph B2["Application"]
        AUTH[Auth + RBAC]
        CORE[Workflow, intake,<br/>scoring, reports]
        AIC[AI client]
    end
    subgraph B3["Data"]
        PG[(PostgreSQL)]
        V[Vault]
    end
    subgraph B4["External AI"]
        G[Gemini File Search]
    end
    U --> WAF --> AUTH --> CORE --> PG
    CORE --> AIC --> G
    CORE --> V
```

| Boundary | What is enforced when crossing it |
| --- | --- |
| Internet to API | HTTPS (TLS terminated by the host); rate limits on sign-in, MFA, refresh, reset and invitations; Pydantic validation. *Planned:* edge bot checks |
| Request to handler | JWT signature, expiry, scope, revoked-token and `token_version` checks on routes that declare authentication; role and ownership checks in services. **45 routes declare none yet** ([Security gaps](../reference/implementation-status.md#security-gaps)) |
| Application to data | ORM-parameterised queries only. *Planned:* encrypted identity fields |
| Application to AI | Teacher-requested background job; the learner profile carries age, grade, home language and areas of concern, never names (`build_profile`); output containing a known name is rejected; saved as a draft |

## External services

| Service | Purpose | Data shared | Requirement |
| --- | --- | --- | --- |
| **Gemini API + File Search Store** | Drafts IEPs, home activities and evaluation questions grounded in the stored guidance | Age, grade, home language, areas of concern; approved goals for evaluation questions | No names; contractual no-retention still open ([Q-12](../reference/decision-log.md#open-questions)); cannot influence scores |
| **SMTP** (`EMAIL_BACKEND=smtp`) | Invitations, parent email verification, password resets | Recipient email, short-lived single-use tokens | TLS in transit, minimal scopes, restricted developer access |
| **Authenticator app** | TOTP second factor for every role | Shared secret (encrypted at rest as `mfa_secret_enc`) | Codes verified server-side only; each time-step usable once |
| **Hosting provider** | Application and database hosting | Everything at rest | Backend deploys to Heroku according to the backend README; region and database host open ([Q-10](../reference/decision-log.md#open-questions)) |

## Main request flows

### Sign-in with MFA

```mermaid
sequenceDiagram
    autonumber
    actor U as User (any role)
    participant PWA
    participant API as Mirai API
    participant DB as PostgreSQL

    U->>PWA: email + password
    PWA->>API: POST /auth/login
    API->>DB: load user, check is_active, locked_until
    alt wrong password
        API->>DB: failed_login_attempts += 1 (lock 15 min at 5)
        API-->>PWA: 401 generic error
    else first sign-in
        API-->>PWA: stage password_change_required or mfa_enrollment_required + step token
        U->>PWA: new password, scan QR, enter code
    else returning user
        API-->>PWA: stage mfa_required + step token
        U->>PWA: 6-digit TOTP code
        PWA->>API: POST /auth/mfa/verify
        API->>DB: check code and last_totp_step
        API-->>PWA: access token + refresh token (JSON body)
    end
```

### Screening to result

```mermaid
sequenceDiagram
    autonumber
    actor T as Teacher
    actor P as Parent
    participant API as Mirai API
    participant SC as Scoring engine
    participant DB as PostgreSQL

    T->>API: open case for student
    API->>DB: case INITIATED
    T->>API: anchor answers, then opened sections
    API->>DB: teacher assessment completed_at, case TEACHER_SCREENING_COMPLETED
    P->>API: answers for the opened sections
    API->>DB: parent assessment completed_at
    API->>SC: POST /domain-scores/case/{id}/calculate
    SC-->>API: domain scores and bands
    API->>DB: scores on case, report
    alt highest domain score at least 2.00
        API->>DB: case PARENT_SCREENING_COMPLETED (support plan recommended)
    else
        API->>DB: case NO_CONCERN_IDENTIFIED
    end
    Note over T: The teacher then requests an IEP draft (POST /ai/cases/{id}/iep)
```

### IEP approval

```mermaid
sequenceDiagram
    autonumber
    actor T as Teacher
    actor SA as School admin
    actor P as Parent
    participant API as Mirai API
    participant AI as Gemini File Search

    T->>API: POST /ai/cases/{id}/iep (202, background job)
    API->>AI: learner profile without names + File Search
    AI-->>API: draft + retrieved document titles
    API-->>T: IEP DRAFT (editable)
    T->>API: edit, then submit
    Note over API: IEP PENDING_APPROVAL
    T->>API: approve
    SA->>API: approve (or reject with reason)
    API->>API: approved_at = now, evaluation_unlock_date = +6 weeks
    API-->>P: plan visible, report rebuilt
```

### Referral export

!!! warning "Planned"

    There is no export endpoint yet. This is the designed flow.

```mermaid
sequenceDiagram
    autonumber
    actor P as Parent
    participant API as Mirai API
    participant DB as PostgreSQL

    P->>API: export referral packet
    API->>API: check role = PARENT and child is theirs
    API->>DB: build de-identified packet from report
    API->>DB: audit EXPORT (no names in details)
    API-->>P: encrypted PDF download
    Note over P: Parent hands it to a professional,<br/>KISE or an EARC if and when they choose
```

## Notifications

Workflow messages are designed as **in-app notifications** stored in the `notification` table, read through `/notifications`. Email is used only for account messages: invitations and password resets (`core/mailer.py`, `services/student.py`).

*Planned:* the API does not create the notifications below automatically yet; the table and endpoints exist.

| Trigger | Recipient | Kind |
| --- | --- | --- |
| Teacher finishes screening | Parent | `PARENT_TURN` |
| Scoring finishes | Teacher and parent | result ready |
| IEP submitted | School administrators of that school | approval needed |
| IEP approved or rejected | Teacher and parent | plan status |
| Evaluation unlocked | Teacher and parent | six-week check open |

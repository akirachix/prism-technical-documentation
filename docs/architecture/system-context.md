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
        PWA[Progressive Web App]
        API[Mirai API<br/>FastAPI]
        DB[(PostgreSQL)]
        PWA <-->|HTTPS + JWT| API
        API <--> DB
    end

    subgraph Third["Third-party services"]
        GEM[Gemini API +<br/>File Search Store]
        MAIL[Resend / SMTP]
        GA[Google Authenticator<br/>TOTP]
        RC[reCAPTCHA v3]
        VAULT[HashiCorp Vault]
        BK[Supabase<br/>encrypted backups]
    end

    PRO[Psychologist / psychiatrist<br/>KISE / EARC]

    T --> PWA
    P --> PWA
    SA --> PWA
    SYS --> PWA
    API -->|de-identified prompt| GEM
    API -->|invites, codes| MAIL
    API -.->|verify code server-side| GA
    PWA -->|token| RC
    API -->|secrets at runtime| VAULT
    DB -->|nightly, encrypted| BK
    P -.->|parent exports packet<br/>outside Mirai| PRO
```

The dashed line to professionals is deliberate: **Mirai never sends anything to a clinic**. The parent downloads the packet and decides who to give it to.

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
| Internet to edge | TLS only (plain HTTP dropped), rate limiting, bot checks, request size and schema validation |
| Edge to application | JWT signature and expiry, revoked-token check, `token_version` check, role and school scope |
| Application to data | ORM-parameterised queries only, school-scoped filters, encrypted identity fields |
| Application to AI | Only reachable after an Elevated or discrepancy result; prompt contains domain, age band and de-identified summaries, never names, dates of birth or school names; output validated and kept as a draft |

## External services

| Service | Purpose | Data shared | Requirement |
| --- | --- | --- | --- |
| **Gemini API + File Search Store** | Drafts IEPs, home activities and evaluation questions grounded in KICD guidance | Domain(s), age band, de-identified score and goal summaries | No child identity data; no retention beyond the request, confirmed contractually; cannot influence scores |
| **Resend / SMTP** | Invitations, verification links, one-time codes, password resets | Recipient email, short-lived single-use tokens | TLS in transit, minimal scopes, restricted developer access |
| **Google Authenticator** | TOTP second factor for staff | Shared secret (encrypted at rest as `mfa_secret_enc`) | Codes verified server-side only; each time-step usable once |
| **Google reCAPTCHA v3** | Bot and brute-force protection | Browser risk signals | No student data; configured for privacy |
| **HashiCorp Vault** | Secrets and encryption keys | Credentials, keys | Never in git; fetched at runtime |
| **Supabase storage** | Encrypted database backups | Encrypted backup files | Restricted, logged access; 30-day expiry |
| **Hosting provider** | Application and database hosting | Everything at rest | Isolated network, disk encryption; region to be confirmed <span class="mi-verify">confirm</span> |

## Main request flows

### Sign-in with MFA

```mermaid
sequenceDiagram
    autonumber
    actor U as Staff user
    participant PWA
    participant API as Mirai API
    participant DB as PostgreSQL

    U->>PWA: email + password (+ reCAPTCHA token)
    PWA->>API: POST /auth/login
    API->>DB: load user, check is_active, locked_until
    alt wrong password
        API->>DB: failed_login_attempts += 1 (lock 15 min at 5)
        API-->>PWA: 401 generic error
    else first sign-in
        API-->>PWA: must_change_password, mfa setup required
        U->>PWA: new password, scan QR, enter code
    else returning user
        API-->>PWA: MFA challenge
        U->>PWA: 6-digit TOTP code
        PWA->>API: POST /auth/mfa/verify
        API->>DB: check code, last_totp_step, write audit LOGIN
        API-->>PWA: access token + refresh cookie (HttpOnly, Secure, SameSite=Strict)
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
    API->>DB: case INITIATED (age gate picks instruments)
    loop one question at a time
        T->>API: answer (queued offline if needed)
    end
    API->>DB: teacher assessment completed_at, case TEACHER_SCREENING_COMPLETED
    API->>DB: notification PARENT_TURN
    loop one question at a time
        P->>API: answer
    end
    API->>DB: case PARENT_SCREENING_COMPLETED
    API->>SC: locked responses
    SC-->>API: domain scores, levels, discrepancy
    API->>DB: domain_score rows, recommendation, report
    alt highest domain score at least 2.00 or discrepancy
        API->>DB: IEP v1 DRAFT
    else
        API->>DB: case NO_CONCERN_IDENTIFIED
    end
    API->>DB: notify teacher and parent
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

    API->>AI: de-identified prompt (domains, age band, summaries)
    AI-->>API: draft + chunk references
    API-->>T: IEP DRAFT (editable)
    T->>API: edit, then submit
    Note over API: IEP PENDING_APPROVAL, case IEP_PENDING_APPROVAL
    T->>API: approve
    SA->>API: approve (or reject with reason)
    API->>API: approved_at = now, evaluation_unlock_date = +6 weeks
    API-->>P: plan visible, report rebuilt
```

### Referral export

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

Workflow messages are **in-app notifications** stored in the `notification` table. Email is used only for account-level messages (invitations, verification, codes, resets).

| Trigger | Recipient | Kind |
| --- | --- | --- |
| Teacher finishes screening | Parent | `PARENT_TURN` |
| Scoring finishes | Teacher and parent | result ready |
| IEP submitted | School administrators of that school | approval needed |
| IEP approved or rejected | Teacher and parent | plan status |
| Evaluation unlocked | Teacher and parent | six-week check open |

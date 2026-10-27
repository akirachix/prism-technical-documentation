---
title: Threat Model
description: Mirai's assets, adversaries, threat scenarios, mitigations, OWASP Top 10 mapping and residual risks.
---

# Threat Model

<p class="mi-lead">The initial threat model for Mirai. It guides architecture review and security testing and should be updated whenever the system changes.</p>

## Assets

| Asset | Description | Sensitivity |
| --- | --- | --- |
| Observational case files | Teacher and parent answers, case notes | High: child-related, special category |
| Scoring outputs | Domain scores (0 to 3), levels, discrepancy flags | High: drive support and referral decisions |
| IEP drafts and plans | KICD-aligned classroom plans and home activities | High: educational planning content |
| Referral packets | De-identified export for professionals | High: controlled external sharing |
| Credentials and roles | Staff accounts, TOTP secrets, admin keys | High: the control plane for access |
| Institutional metrics | Aggregated counts for directors | Medium |
| Offline PWA cache | Queued answers on teacher devices | High if residue remains on a shared device |

## Adversaries

| Adversary | Goal |
| --- | --- |
| External attacker | Unauthorised access to APIs, accounts or exported packets |
| Compromised or malicious staff account | Use a teacher or director account beyond its privilege |
| Insider seeking admissions or discipline leverage | Read raw observations to reject, exclude or punish a child |
| Parent channel abuse | Reach another child's data or escalate privileges |
| Shared-device user | Read cached data or a leftover session on a school device |
| Over-reaching or compromised system admin | Mass export, archival or configuration sabotage |

## Threats and mitigations

Mitigations are the design. Those not built yet are marked *planned*; the full list is on [Implementation Status](../reference/implementation-status.md).

| Threat scenario | Impact | Primary mitigations |
| --- | --- | --- |
| Director or other role reads raw observations | Breach of purpose limitation; punitive admissions use; loss of trust | Role-specific response models; admins limited to aggregates and approval views; audited access attempts |
| Credential theft or weak staff password | Case exposure, false observations, fraudulent plans | Argon2 hashing, TOTP for every role, lockout, rate limits. *Planned:* reCAPTCHA, session timeouts |
| Client-side score or alert manipulation | Wrong gating; inappropriate referral or support | The API calculates scores server-side. **Gap:** the PWA still scores in the browser and `PATCH /cases/{case_id}` accepts the scores it sends |
| IDOR: changing a student or case id in a request | Cross-child or cross-school exposure | Parent ownership checked for cases (`_parent_owns`, `tests/test_parent_access.py`). **Gap:** 45 routes have no authentication |
| Referral packet intercepted or leaked | Exposure of child-related content | *Planned* (no export yet) |
| Residual offline cache on a shared device | Next user sees drafts | Session cleared on sign-out. Offline answer queue *planned* |
| Parent channel reaches another learner | Cross-child exposure | Parent bound to a verified child and school; no cross-learner navigation |
| AI invents clinical labels | Misleading output; regulatory and ethical exposure | AI isolated from scoring; prompt forbids diagnoses; recommendations naming a condition rejected; dual approval. *Planned:* condition check on IEP text |
| AI prompt carries identity data to a third party | Unlawful transfer, privacy breach | Profile sent without names; output with a known name rejected; store holds reference documents only. Contractual no-retention open ([Q-12](../reference/decision-log.md#open-questions)) |
| Token replay after sign-out | Session hijack | `revoked_token` table, `token_version`, short access tokens |
| System admin over-reach | Mass exposure or sabotage | Least privilege; admin screens show no child content; logged archival and configuration changes; dual control for high-impact actions where practical |
| Unbounded AI regeneration | Cost spike, output drift | One running job per kind per case. *Planned:* three attempts per cycle, then 24-hour cooldown |

## OWASP Top 10 (2025)

| Risk | How Mirai is protected |
| --- | --- |
| **A01 Broken Access Control** | Non-overlapping roles; role guards (`dependencies.py`); parent ownership checks. **Gap:** 45 routes have no authentication ([Security gaps](../reference/implementation-status.md#security-gaps)) |
| **A02 Security Misconfiguration** | Production refuses to start without its keys, SMTP and an HTTPS frontend URL (`core/config.py`); CSP and HSTS in production. *Planned:* docs disabled in production, default-deny on sensitive endpoints |
| **A03 Software Supply Chain Failures** | `uv.lock` pins backend dependencies; AI isolated from the scoring core. *Planned:* pip-audit and Safety in CI |
| **A04 Cryptographic Failures** | TLS in transit; TOTP secrets encrypted; RS256 keys from the environment. *Planned:* field encryption, encrypted exports, Vault with key versioning |
| **A05 Injection** | Pydantic validation; ORM-parameterised queries; fixed stored questions with integer answers; CSP in production |
| **A06 Insecure Design** | Threat model and requirements at design time; purpose limitation and anti-admission rules as first-class constraints; deterministic server-side scoring; human review gate |
| **A07 Authentication Failures** | TOTP for every role; lockout; single-use reset tokens. *Planned:* reCAPTCHA, session timeouts |
| **A08 Software or Data Integrity Failures** | AI output stays a draft until approved. **Gap:** client-calculated scores are accepted (see above). *Planned:* offline sync with idempotency keys |
| **A09 Security Logging and Alerting Failures** | Auth events in the server log; consent in the `audit_log` table, which the application cannot alter. *Planned:* audit rows for case access, role changes and exports; monitoring |
| **A10 Mishandling of Exceptional Conditions** | Unhandled errors return a generic `500`; AI failures mark the job `FAILED` and change nothing else. *Planned:* regeneration limits |

## Residual risks

These need operational controls beyond application design:

- **Social engineering** of staff or parents: training and clear in-app guidance.
- **Physical access** to unlocked school devices: device policy and short idle timeouts.
- **Supply-chain compromise** of libraries or hosting: vendor due diligence and dependency monitoring.

## Open items for architecture review

| Item | Why it matters |
| --- | --- |
| Contractual no-retention by the AI provider | Isolation must cover data retention, not only arithmetic integrity |
| Server-side discrepancy enforcement | A client-side check could be bypassed with high-harm consequences |
| Concrete design for transfer-visibility blocking | The school-transfer moment is where stigma-driven misuse is most likely |

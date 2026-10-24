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

| Threat scenario | Impact | Primary mitigations |
| --- | --- | --- |
| Director or other role reads raw observations | Breach of purpose limitation; punitive admissions use; loss of trust | Role-specific response models; admins limited to aggregates and approval views; audited access attempts |
| Credential theft or weak staff password | Case exposure, false observations, fraudulent plans | Strong hashing, TOTP MFA, reCAPTCHA, lockout, admin-controlled reset, session timeouts |
| Client-side score or alert manipulation | Wrong gating; inappropriate referral or support | Scores computed server-side only; no client score accepted |
| IDOR: changing a student or case id in a request | Cross-child or cross-school exposure | Ownership resolved server-side; school from token; `404` out of scope; IDOR tests |
| Referral packet intercepted or leaked | Exposure of child-related content | De-identification, encryption, parent-only export, audit |
| Residual offline cache on a shared device | Next user sees drafts | Queue holds answers only; cleared on sign-out and expiry; short retention |
| Parent channel reaches another learner | Cross-child exposure | Parent bound to a verified child and school; no cross-learner navigation |
| AI invents clinical labels | Misleading output; regulatory and ethical exposure | AI isolated from scoring; output guard; dual human approval; non-diagnostic language policy |
| AI prompt carries identity data to a third party | Unlawful transfer, privacy breach | Prompt builder strips identity; store holds curriculum only; contractual no-retention |
| Token replay after sign-out | Session hijack | `revoked_token` table, `token_version`, short access tokens |
| System admin over-reach | Mass exposure or sabotage | Least privilege; admin screens show no child content; logged archival and configuration changes; dual control for high-impact actions where practical |
| Unbounded AI regeneration | Cost spike, output drift | Three attempts per cycle, then 24-hour cooldown |

## OWASP Top 10 (2025)

| Risk | How Mirai is protected |
| --- | --- |
| **A01 Broken Access Control** | Non-overlapping roles; parent bound to a verified child and school; authentication and role checks on every request; no client-side privilege elevation |
| **A02 Security Misconfiguration** | HTTPS enforced; default-deny on sensitive endpoints; secure session settings; debug and docs disabled in production; staging and production configurations reviewed |
| **A03 Software Supply Chain Failures** | Dependency scanning (pip-audit, Safety); approved packages only; vendor due diligence; AI component isolated from the scoring core |
| **A04 Cryptographic Failures** | Encryption at rest and in transit; encrypted, de-identified exports; keys in Vault with versioning |
| **A05 Injection** | Pydantic validation; ORM-parameterised queries; finite state machine intake instead of free-text interpretation; HTML stripped and CSP |
| **A06 Insecure Design** | Threat model and requirements at design time; purpose limitation and anti-admission rules as first-class constraints; deterministic server-side scoring; human review gate |
| **A07 Authentication Failures** | Staff MFA (email verification, reCAPTCHA, TOTP); admin-only credential resets; session timeouts; verified parent relationship |
| **A08 Software or Data Integrity Failures** | Scores only on the server; AI output stays draft until reviewed; offline sync over authenticated channels with idempotency keys |
| **A09 Security Logging and Alerting Failures** | Case access, role changes, resets, archival and exports logged with actor, time and target; logs protected from alteration; health monitoring without child content |
| **A10 Mishandling of Exceptional Conditions** | Sanitised errors; defined offline and session-end behaviour; regeneration limits; AI failure leaves a safe draft |

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

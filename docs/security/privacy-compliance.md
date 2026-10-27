---
title: Privacy and Compliance
description: How Mirai meets the Kenya Data Protection Act 2019 and related law - personal data, purpose, minimisation, retention, consent and rights.
---

# Privacy and Compliance

<p class="mi-lead">Mirai processes personal data about children aged 4 to 9. Its design follows the Kenya Data Protection Act, 2019, the Children's Act and the Persons with Disabilities Act.</p>

!!! note "Not legal advice"

    This page records the team's compliance design for internal review and audit preparation. It is not legal advice.

## Legal framework

| Law or standard | What it requires | How Mirai responds |
| --- | --- | --- |
| **Kenya Data Protection Act, 2019** and the Data Protection (General) Regulations, 2021 | Lawful basis, purpose limitation, minimisation, accuracy, storage limitation, integrity and confidentiality, accountability | Field encryption, separation of identity and observation data, purpose limits, retention schedule, audit trail |
| **Children's Act** | Heightened safeguards for systems that involve children | Non-diagnostic workflow, no permanent labels, parental consent before any profile |
| **Persons with Disabilities Act** | No discriminatory use of records about learning differences | Anti-admission and anti-disciplinary firewall; admins blocked from raw observations |
| **OWASP Top 10:2025** | Defend against the main web risks | See the [Threat Model](threat-model.md#owasp-top-10-2025) |
| **ISO/IEC 27001** (reference) | Information security management | RBAC, vulnerability tracking, continuous audit logging |

**Lawful basis:** the institutional contract with the school, and legitimate interest in supporting educational inclusion, with safeguards for children. Parental consent is required before any child profile exists.

## Data classification

| Data | Sensitivity | Protection |
| --- | --- | --- |
| Child name and date of birth | High | Application-layer encryption, separated from observation tables, RBAC |
| Parent phone and email | High | Encrypted at rest, restricted access, minimised |
| Screening answers | High (special category) | Decoupled tables, single-submission per role, school isolation |
| Domain scores, levels, discrepancy flags | High | Server-side calculation, isolated from AI, append-only logs |
| IEP drafts and approved plans | High | Human-in-the-loop, private containment, scoped access |
| Referral packet | High | De-identified, encrypted, parent-initiated |
| Consent records | High | Immutable trail, enforced before profile creation |
| Credentials and secrets | Critical | Argon2id or bcrypt, Vault, MFA |
| Session tokens | Critical | Secure cookie flags, timeouts, server-side revocation |
| Audit logs | High | Insert-only, no personal content |
| Institutional metrics | Medium | Aggregates only, re-identification filters |
| Offline browser cache | High | Short retention, cleared at sign-out, answers only |

All behavioural and observation data is treated as **special-category data on par with health data**, whether or not any label is ever attached (AppSec REQ-1.1).

## Purpose

Data is processed only to run the school-level pre-referral workflow: turn classroom concerns into structured two-informant documentation, compute domain scores, prepare KICD CBC-aligned IEPs and give parents a report they can choose to share.

Mirai does **not** process data for advertising, teacher performance tracking, student profiling, admissions or discipline.

## Data minimisation

- Only the integers needed by the active, age-gated instruments, plus short case notes where a workflow needs them (for example a closing reason).
- No free-text journaling, audio or video, and no location tracking.
- Prompts to the AI service contain no identity data.
- Audit rows contain ids and short notes only.

## Consent

| Rule | Detail |
| --- | --- |
| Before profile | A signed parental consent record must exist before a child profile can be initialised |
| Double opt-in | School-level consent through the subscription, plus the individual parent's consent |
| Purpose stated | Pre-referral observation only, not diagnosis, admissions or discipline |
| Re-presentable | The parent can view what they agreed to, in plain language, at any time |
| Withdrawal | Must halt processing and start the defined lifecycle event, not just toggle a flag. Behaviour is an open decision ([Q-04](../reference/decision-log.md#open-questions)); not built |
| Storage | Consent records are stored separately from observation data |

## Data sharing

Mirai has **no automatic data pipelines** to clinics, government databases or school management systems. Sharing is single-blind and parent-initiated: when the parent presses **Export**, a de-identified, encrypted packet is generated for them to hand over physically or digitally. Every export is audited.

## Data retention

Personal data is kept only as long as the pre-referral purpose needs it (Regulation 19, Data Protection (General) Regulations, 2021). A **termly cleanup task** is designed to enforce these periods; it is *planned* and not in the code yet.

| Data | Retention | At expiry |
| --- | --- | --- |
| Raw screening answers and teacher notes | Until the case closes, plus 90 days | Hard purge |
| Domain scores, alert levels, discrepancy flags, IEP drafts | End of academic year or when the child leaves the school, whichever is earlier, plus a 30-day parent export window | Hard purge |
| Child identity (name, date of birth, grade) and parent contacts | While enrolled, plus 30 days after leaving the school or completing Grade 3 | Hard purge |
| Parental consent records | Reduced to a minimal proof (pseudonymous id, consent version, date, withdrawal status) for 12 months after the related data is purged | Hard purge |
| Security audit logs | 12 months (actor UUIDs and resource hashes only) | Purge |
| Database backups | Rolling cycle of no more than 35 days | Automatic expiry |

!!! warning "Open point: retention vs. longitudinal record"

    The PRD and Technical Requirements say child records are **never hard deleted** except on confirmed school transfer or transition to secondary school, to keep a longitudinal record. The security requirements set the shorter purge schedule above. Both cannot hold at once; the team must agree which governs which data. Logged in the [Decision Log](../reference/decision-log.md).

## Account deactivation and contract end

- **Staff leave:** the account is deactivated immediately (sessions end, tokens revoked). The roster is reassigned within 30 days; then name, phone and email are deleted, leaving only the pseudonymous UUID in audit logs.
- **School ends its subscription:** 30 days to export what it needs; all of that school's data purged within 60 days of contract end.
- **Deactivation is never deletion** for child data; deletion follows the retention rules.

## Data subject rights

| Right | How it is supported |
| --- | --- |
| Access | Parent dashboard shows the child's report, plan and history; access reports from the audit trail on request |
| Correction | Teachers correct draft content before submission; authorised corrections update the source record without altering audit history |
| Deletion and consent withdrawal | Withdrawal triggers the lifecycle event; deletion cascades to derived artefacts (IEPs, packets, cached scores) |
| Information | A plain-language privacy notice in the parent PWA, in English and Kiswahili |

## Third-party processors

| Processor | Role | Note |
| --- | --- | --- |
| Google (Gemini API) | AI generation | No identity data (names are scrubbed and rejected, `services/ai.py`). Contractual no-retention is still open ([Q-12](../reference/decision-log.md#open-questions)); cross-border transfer review needed |
| Authenticator apps | TOTP codes generated on the user's phone | No data leaves the phone. reCAPTCHA is planned, not used |
| Resend / SMTP provider | Transactional email | Staff and parent emails, single-use tokens |
| Supabase | Encrypted backups (*planned*) | Restricted, logged access |
| Hosting provider | Application and database | East Africa region requested |

## Breach response

Because a leak of child-level observation data carries an elevated harm profile (stigma, discrimination), Mirai needs a breach threshold and notification path specific to this data, separate from a generic incident plan (AppSec REQ-8.2). Under the KDPA, the Data Commissioner must be notified within 72 hours of becoming aware of a qualifying breach, and affected data subjects informed where there is a real risk of harm. The Mirai-specific procedure (who decides a breach has happened, who notifies, and the message templates) is not written yet; it is listed under outstanding actions below.

## Outstanding compliance actions

- [ ] Data processing agreements with each partner school, defining controller and processor roles under the KDPA.
- [ ] Final retention schedule and purge triggers agreed (see open point above).
- [ ] Parent-facing notice explaining purpose, non-diagnostic status and rights.
- [ ] Cross-border processing review for hosting and AI endpoints.
- [ ] Internal register of processing activities.
- [ ] Contractual confirmation of no prompt retention by the AI provider.
- [ ] Child-data breach response plan.

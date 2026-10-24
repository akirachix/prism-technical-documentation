---
title: Decision Log
description: Architecture and product decisions for Mirai, open questions with interim values, and conflicts between source documents.
---

# Decision Log

<p class="mi-lead">What has been decided, what is still open, and where Team Prism's documents disagree. Update this page in the same pull request that resolves an item.</p>

## Decisions

| Id | Decision | Rationale | Source |
| --- | --- | --- | --- |
| D-01 | Mirai is non-diagnostic; no clinical labels anywhere | Stigma tracks the label; clinical capacity is out of scope | PRD, Technical Requirements |
| D-02 | Scoring is deterministic, server-side and isolated from AI | Identical inputs give identical, explainable outputs | Technical Requirements |
| D-03 | Domains are scored separately and never blended; any Elevated domain makes the case Elevated | Averaging would dilute a real concern | Technical Requirements |
| D-04 | A large teacher and parent discrepancy is treated like an Elevated result | Disagreement is a signal; waiting delays help. Replaces the earlier "force Medium at 1.5" draft | Technical Requirements (supersedes Product Management draft) |
| D-05 | Intake is a finite state machine, not a chatbot | Deterministic and auditable question order | Technical Requirements |
| D-06 | One PWA for every role; no WhatsApp channel | No install, one codebase; parents use the same app from a link. Replaces the WhatsApp bot of early drafts | Technical Requirements, PRD |
| D-07 | Gemini API with File Search Store for RAG | Managed retrieval; no vector database to run | Technical Requirements |
| D-08 | Dual approval (teacher + school admin) before an IEP is active | Human control over AI output | Technical Requirements, Data Models |
| D-09 | Regeneration limited to 3 per cycle, then 24-hour cooldown, stored per case | Avoid retry loops and cost spikes | Technical Requirements |
| D-10 | Six-week evaluation from the IEP's short-term goals, scored -2 to 2 by both informants | Measures progress on the plan itself. Replaces the "Week 12, three questions" PRD wording | Technical Requirements, Data Models |
| D-11 | Shared schema with `school_id` scoping | Linear cost with schools | Technical Requirements |
| D-12 | Instrument layer is swappable | Cultural validity is contested | Technical Requirements |
| D-13 | Dyslexia not scored for ages 4 to 5 | CLDQ-R depends on reading instruction | Technical Requirements |
| D-14 | Teacher screens first; parent is notified and screens next | Simpler status flow; parent sees a clear "your turn" | Data Models updates |
| D-15 | Workflow notifications are in-app; email only for account messages | No SMS cost; fewer channels holding child context | Data Models updates |
| D-16 | English only for the first release; Kiswahili later | Scope | QA strategy |
| D-17 | Parents are never billed; schools pay an annual subscription | Avoid donor dependency; remove cost barrier for families | PRD, presentation |

## Open questions

| Id | Question | Interim value | Owner |
| --- | --- | --- | --- |
| Q-01 | Discrepancy threshold and boundary | Absolute difference ≥ **1.00** on any domain, inclusive | Product + clinical advisor |
| Q-02 | Age calculation rule | Completed years on the day the case opens; no re-routing on birthdays | Product |
| Q-03 | One-sided or missing intake at window close | Score the completed side, discrepancy not applicable, Elevated still possible; if neither completes, close as incomplete | Product |
| Q-04 | Consent withdrawal behaviour | Lock case, block new observations, keep scores and plans for audit marked "consent withdrawn", disable export; deletion by system admin after retention | Product + legal |
| Q-05 | Parent second factor | Email one-time code (architecture diagram) vs TOTP for all users (data model) vs password only (security requirements) | Security |
| Q-06 | Report visibility for school administrators | Parent only (data model) until resolved | Product + security |
| Q-07 | Rounding rule for scores | Round half-up to two decimals after the final calculation | Backend |
| Q-08 | Model | Gemini 3.5 Flash (architecture) vs Flash-Lite (security requirements) | AI |
| Q-09 | Home activities source | Templates now (data model); RAG over the activity bank later (PRD) | AI + product |
| Q-10 | Hosting provider and region | East Africa region requested; provider not chosen | Platform |
| Q-11 | Consent, referral packet and longitudinal record tables | Not yet modelled | Backend |
| Q-12 | Contractual no-retention with the AI provider | Required before production | Legal |

## Conflicts between source documents

| Id | Topic | Conflict | Proposed resolution |
| --- | --- | --- | --- |
| C-01 | Retention | PRD and Technical Requirements: never hard-delete except on transfer or secondary transition. Security requirements: hard-purge on a schedule (raw answers at case close + 90 days, scores at year end + 30 days) | Agree which data the longitudinal record keeps (for example outcomes only) and purge the rest on schedule |
| C-02 | Encryption algorithm | Security requirements say "RSA-256" for fields and backups | Use AES-256-GCM for fields and backups, keys in Vault; update the requirement wording |
| C-03 | Session timeout | 15 minutes idle / 8 hours absolute (staff) and 30 minutes (parents) vs "3-minute inactivity" in the sensitive-data and threats tables | Adopt 15 / 8 h / 30 min; correct the tables |
| C-04 | Backup retention | 30-day expiry (architecture) vs up to 35 days (security requirements) | 30 days satisfies both |
| C-05 | School admin visibility | Some documents: macro metrics only. Technical Requirements and data model: may open the IEP draft and the three domain scores while approving | Admin sees aggregates, plus draft and scores during approval only, every view logged |
| C-06 | Age gate for autism at 4 to 5 | Security requirements omit CAST for ages 4 to 5; Technical Requirements and QA include it | CAST at both age gates |
| C-07 | Level names | UI says Low / Medium / Elevated; data model enum says LOW / MODERATE / HIGH | Keep the enum, map labels in the UI |
| C-08 | Parallel vs sequential intake | PRD: parallel and asynchronous. Data Models updates: teacher first, then parent | Sequential (D-14); both still inside the 7-day window |
| C-09 | Product name | Early drafts call the product KEVIN or Daraja | Mirai everywhere |

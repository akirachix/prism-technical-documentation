---
title: Reference
description: Supporting references for Mirai - glossary, decision log, team and source documents.
---

# Reference

<p class="mi-lead">Look-ups that support the rest of the documentation.</p>

<div class="mi-grid" markdown>

<div class="mi-card mi-card--navy" markdown>
:material-book-alphabet:
### [Glossary](glossary.md)
Every acronym and Mirai-specific term in one place, from ADHD RS-IV to UUID.
</div>

<div class="mi-card mi-card--red" markdown>
:material-scale-balance:
### [Decision Log](decision-log.md)
Decisions made, open questions with interim values, and conflicts between source documents.
</div>

<div class="mi-card mi-card--orange" markdown>
:material-account-group-outline:
### [Team](team.md)
Team Prism members, supervisors and workstreams.
</div>

</div>

## Screening instruments

| Instrument | Domain | Ages in Mirai | Notes |
| --- | --- | --- | --- |
| **CAST** (Childhood Autism Spectrum Test) | Autism | 4 to 9 | Observational questionnaire |
| **ADHD Rating Scale IV, Preschool Version** | ADHD | Under 5 in the code; 4 to 5 in the requirements ([C-10](decision-log.md#conflicts-between-source-documents)) | Observational rating of attention and activity |
| **SNAP-IV** | ADHD | 6 to 9 | Observational rating scale |
| **CLDQ-R Dyslexia Subscale** | Dyslexia | 6 to 9 | Depends on reading instruction having started |

Question wording must be checked against the official instrument before use (`is_text_verified`), and licence or open-access terms confirmed for each instrument.

## Kenyan institutions

| Name | Role relevant to Mirai |
| --- | --- |
| **KICD** (Kenya Institute of Curriculum Development) | Publishes the CBC and inclusive-education guidance used to ground IEPs |
| **KISE** (Kenya Institute of Special Education) | National assessment and referral centre; a destination for referral packets |
| **EARC** (Educational Assessment and Resource Centre) | County-level assessment centres |
| **KNH** (Kenyatta National Hospital) | National referral hospital with developmental services |
| **Office of the Data Protection Commissioner** | Regulator under the Kenya Data Protection Act, 2019 |
| **Ministry of Education / Ministry of Health** | Sources of the regulatory legitimacy signal schools and parents look for |

## Source documents

| Document | Date |
| --- | --- |
| Team Prism Product Requirements Document | 25 Sep 2026 |
| Team Prism Technical Requirements | 1 Oct 2026 |
| Team Prism Neurodivergence Presentation | 7 Oct 2026 |
| Team Prism Data Models and Data Models updates | 12 Oct 2026 |
| Security and Privacy Requirements; AppSec; Threat Modelling; Compliance Notes; Security Requirements | Oct 2026 |
| QA Discovery and High Level Strategy; QA test case workbooks | Oct 2026 |
| Product Management: foundation metrics, feature prioritisation (MoSCoW, RICE), metrics, competitor analysis | Sep to Oct 2026 |
| UX Research: field research plan, interview guide, transcripts and analysis, literature review, research report | Jul to Sep 2026 |
| Mirai style guide, wireframes, hi-fi prototypes, system architecture diagrams, FigJam user flows | Oct 2026 |

## Feature priorities

| Epic | MoSCoW | RICE inputs (reach, impact, confidence %, effort) |
| --- | --- | --- |
| Onboarding and login | Must have | 370, 3, 90, 0.29 |
| Assessment and domain scoring | Must have | 360, 3, 80, 0.43 |
| Report generation | Must have | 290, 1, 80, 0.71 |
| IEP generation | Must have | 168, 1, 60, 0.71 |
| Evaluation | Should have | 110, 3, 70, 0.43 |
| Parent recommendations | Should have | 98, 1, 60, 0.71 |
| School management | | impact 0.5, effort 0.71 |

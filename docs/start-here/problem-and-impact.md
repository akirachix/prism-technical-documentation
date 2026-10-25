---
title: Problem and Impact
description: The community problem Mirai addresses, the research behind it, the business model and how success is measured.
---

# Problem and Impact

<p class="mi-lead">Why Mirai exists, what Team Prism learned in the field, how the product sustains itself and how we will know it is working.</p>

## Background

Nairobi County's private education sector is large and tiered. Kenya's Competency Based Curriculum (CBC) asks Kindergarten to Grade 3 teachers to track every learner across many performance strands, yet formal developmental support sits almost entirely outside the classroom, concentrated in a few nationally mandated centres such as the **Kenya Institute of Special Education (KISE)** and **Kenyatta National Hospital (KNH)**.

High-fee international academies have built their own learning-support units to fill that gap. **Mid-tier and low-cost private schools, which educate most of Nairobi's urban children, have not.**

<div class="mi-stats" markdown>
<div class="mi-stat"><strong>~1.1 million</strong><span>children aged 5 to 9 live in Nairobi; about 70% attend private schools</span></div>
<div class="mi-stat"><strong>9.1%</strong><span>neurodevelopmental difference prevalence among 6 to 9 year olds in the best available Kenyan study (Kilifi, 2025)</span></div>
<div class="mi-stat"><strong>95k to 100k</strong><span>Nairobi children implied to be living with a diagnosable neurodevelopmental difference today</span></div>
<div class="mi-stat"><strong>59.5 months</strong><span>mean age of autism diagnosis in Kenya</span></div>
</div>

!!! note "About these figures"

    The 95,000 to 100,000 estimate applies the Kilifi prevalence study to Nairobi's child population, because it is the most relevant Kenyan study available. Treat it as an order-of-magnitude estimate, not a census. Sources are listed in the Team Prism research report and presentation deck.

## The problem

Early childhood educators observe children for six to eight hours a day, yet learning and behavioural differences often go unrecorded before age seven. In the schools Mirai targets, teachers face:

- **No standardised, low-burden way** to document a persistent learning or behavioural concern.
- Concerns that surface only as **unstructured verbal feedback at pick-up time**, which tends to trigger parental denial rather than cooperation.
- A **financial pathway discovered one stage at a time**: a free first consultation, then an unexpected therapy bill, then a further paid assessment.
- **No mechanism to turn a confirmed concern into a classroom plan** once it is finally raised.

Developmental information ends up in paper binders or WhatsApp threads, so schools cannot build the evidence needed to justify KICD CBC accommodations, and children risk punitive grade-repetition instead of support.

### Problem statement

> Early childhood educators in Nairobi observe children for 6 to 8 hours daily, yet critical learning and behavioural variances remain unrecorded before age 7. Mainstream private schools lack standardised pre-referral tracking, leaving early detection to individual teacher intuition and ad-hoc verbal updates at the school gate. This unstructured communication triggers parental denial and social stigma, contributing to a 35-month diagnostic delay and trapping vulnerable children in grade-repetition loops.

### How might we

> **How might we** help early-years teachers and parents in Nairobi's private schools document developmental concerns consistently and early, without needing clinical training or triggering the stigma that stalls follow-through, so children can reach support during the years intervention still works best?

## Research approach

Team Prism used a mixed-methods design so that neither literature alone (risking Western assumptions) nor field data alone (risking re-invented conclusions) carried the whole picture.

<div class="mi-grid" markdown>

<div class="mi-card mi-card--navy" markdown>
:material-book-open-page-variant-outline:
### Desk research
Systematic review of academic, institutional and policy sources from 2011 to 2026 (PubMed, Google Scholar, WHO IRIS, KISE audits, Kenya's Mental Health Policy, CBC guidelines), graded in a four-tier evidence hierarchy from direct Nairobi evidence to global comparators.
</div>

<div class="mi-card mi-card--red" markdown>
:material-account-voice:
### Field research
One mid-tier Nairobi private school (pre-primary to Grade 3), two parents of neurodivergent children and a consulting clinical psychologist. Semi-structured interviews, structured caregiver conversations, classroom observation and expert consultation, sequenced administrator, teacher, parent, specialist.
</div>

<div class="mi-card mi-card--orange" markdown>
:material-clipboard-text-outline:
### Surveys and workshops
Three online surveys for school administrators, parents and teachers distributed through WhatsApp forums, followed by validation work used by QA: 18 teacher interviews, a 42-parent survey and two director workshops.
</div>

</div>

Elite international schools and public or rural schools were deliberately excluded, because they sit under different funding and policy structures.

## What we found

| # | Finding | What it means for the product |
| --- | --- | --- |
| 1 | **No structured instrument exists at school level.** Identification relies on unaided teacher observation over one to two years. | Digitise and *enforce* a validated, age-gated instrument set as the mandatory intake path. |
| 2 | **The referral pathway works, but only once triggered.** Initial consultation is procedural and free; nothing finds cases earlier. | Generate referral-ready output automatically once a result is Elevated. |
| 3 | **Cost is a three-stage barrier.** Free KISE consultation, then therapy (about KSh 24,000 a month), then clinical assessment (over KSh 30,000, with a multi-month wait). | Never present cost as resolved after the referral export. |
| 4 | **Parental denial is distinct from community stigma.** A parent described her own initial denial. | Use non-clinical, non-deficit language and give parents their own private channel. |
| 5 | **Stigma tracks the label more than the behaviour.** | Mirai never issues a label; results are framed as observations. |
| 6 | **Cultural validity of Western instruments is contested.** The literature says biased; the consulting psychologist disagreed. | Treat as unresolved: the instrument layer is swappable. |
| 7 | **Discreet, non-labelling accommodation is already school practice.** | No feature may make a flagged child visible beyond the people who must act. |
| 8 | **Adoption depends on parental trust and regulatory legitimacy.** | Support a configurable institutional or regulatory affiliation marker on school and parent screens. |
| 9 | **Institutional memory depends on staff tenure.** A child's history is one physical file. | Keep a per-child longitudinal record that any current teacher at the school can read. |

These findings are traced one by one to technical requirements in [Architecture](../architecture/index.md#requirements-traceability).

## Other numbers that shaped the design

| Indicator | Value |
| --- | --- |
| Kenyan private-school teachers with any disability training | under 38.4% |
| ...with neurodevelopmental-specific training | 25.4% |
| Caregivers who first pursue a traditional or spiritual pathway | 60 to 70% |
| Teacher vs. parent accuracy predicting ADHD | 93.7% vs. 89.9% |
| Pooled ADHD prevalence across Africa | 7.47% |
| Dyslexia prevalence, children aged 7 to 9 in a Nairobi school | 7.49% |
| Typical early-years class size in target schools | 45 to 65+ learners per teacher |

The teacher-versus-parent accuracy gap is one reason Mirai uses **both** informants and treats a large disagreement between them as meaningful rather than noise (see [Discrepancy handling](../backend/scoring-engine.md#discrepancy-handling)).

## Business model

<div class="mi-grid mi-grid--2" markdown>

<div class="mi-card mi-card--navy" markdown>
#### B2B annual subscription
Schools pay **KSh 15,000 to 30,000 per school per year**. Parents are never charged. This avoids the donor-dependency collapse common to NGO-funded pilots in the region.
</div>

<div class="mi-card mi-card--orange" markdown>
#### Break-even and the watch-out
Break-even is estimated at **about 100 to 150 subscribing schools**, pending pilot validation. The risk: target schools have the least budget flexibility to add a new tool, so infrastructure cost must grow linearly with schools onboarded.
</div>

</div>

That cost constraint is why the architecture favours a single shared-schema PostgreSQL database, a managed retrieval service instead of a self-hosted vector database, and a PWA instead of native apps.

## Expected impact

<div class="mi-grid" markdown>

<div class="mi-card mi-card--red" markdown>
#### For children
Earlier support within the optimal window (around 18 months for autism, early school years for ADHD, Kindergarten to Grade 1 for dyslexia). Every month taken off the 34.9-month delay is time returned during the most responsive developmental years.
</div>

<div class="mi-card mi-card--orange" markdown>
#### For teachers
A structured, non-clinical record replaces the weight of raising concerns alone, and observation history survives staff turnover and grade changes.
</div>

<div class="mi-card mi-card--navy" markdown>
#### For parents
A private, incremental, non-stigmatising pathway replaces the "ambush" conversation at the school gate, and the parent stays in control of who sees what.
</div>

<div class="mi-card mi-card--red" markdown>
#### For schools
The first structured option for schools that have neither elite budgets nor guaranteed KISE access, reducing default reliance on disciplinary explanations for undocumented concerns.
</div>

<div class="mi-card mi-card--orange" markdown>
#### For the ecosystem
Evidence that lightweight, continuous, non-specialist screening can work inside a private school, a category of evidence that barely exists today.
</div>

</div>

## Measuring success

### North Star metric

> **The proportion of initiated cases that reach a completed teacher and parent screening within the seven-day window.**

Today's baseline is not a poorly performing process; it is the absence of one. A rising completion rate is the earliest, most direct sign that Mirai is replacing that absence with a working habit, ahead of any claim about alert accuracy or referral outcomes. On the system administrator dashboard this appears as **Students screened**.

### Supporting metrics

| Metric | Dashboard | What it tells us |
| --- | --- | --- |
| Schools onboarded | System admin | Acquisition: schools whose administrator activated the account |
| Teachers onboarded per school | System admin | Whether a school's decision to adopt cascades to its teachers |
| Student profiles created | System admin | Whether teacher and parent onboarding is simple enough |
| AI output quality (approved without regeneration) | System admin | Whether the IEP engine needs better curriculum indexing |
| Teacher-rated IEP quality (1 to 5) | System admin | Explicit satisfaction with AI drafts |
| IEP regeneration rate | System admin | How often teachers regenerate instead of editing |
| Active school administrators (30 days) | System admin | Whether the admin dashboard has ongoing value |
| Students per teacher | School admin | Workload assumptions for UX and support |
| IEPs generated | School admin | Whether flags become classroom plans |
| Active teachers (7 days) and parents (30 days) | School admin | Core retention |
| Churn rate | System admin | Early warning for usability or fit problems |
| Follow-up completion rate | System admin | Whether the full support loop is used end to end |

The PRD also tracks **parental inclusion velocity** (target: parent completes within 48 hours of the teacher), the **discrepancy-triggered rate**, the **accommodations onboarding ratio** (Elevated cases whose IEP is approved and used) and **infrastructure scaling efficiency** (cost grows linearly with schools).

## Competitive landscape

| Product | Origin | Focus | Why it does not solve this problem |
| --- | --- | --- | --- |
| Igaju | Rwanda | Mobile autism trait screening and appointment requests | Autism only; no teacher and parent triangulation; health-system rather than school workflow |
| Playground IEP | USA | AI IEP writing and caseload management | Works after identification; built for US special-education systems, not KICD |
| Do-IT Profiler | UK | Multi-condition school screening | Premium pricing out of reach for mid-tier Nairobi schools; no CBC alignment; diagnostic-leaning framing |
| AIDA (DAWN AI) | Nigeria | AI neuro-diagnostic agent | Diagnostic positioning, which is what Mirai deliberately avoids |
| Disability Detect | Ghana, Rwanda, Uganda | Washington Group teacher screening | NGO-funded; no IEP generation or parent co-informant |
| DOK + Rare Gem | Kenya | Paper toolkit, teacher training, specialised school | Paper-based; no digital continuity |

**Mirai's position:** the only option combining low-burden two-informant screening, stigma-aware parent design, KICD-grounded support plans and a family-controlled referral path, priced for mid-tier and low-cost private schools.

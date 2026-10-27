---
title: Glossary
description: Definitions of the technical, legal and Mirai-specific terms used across the documentation.
---

# Glossary

<p class="mi-lead">Plain-language definitions, in alphabetical order.</p>

ADHD Rating Scale IV, Preschool Version
:   Observational questionnaire used in Mirai for children under 5 to record attention and activity behaviours (age 5 uses SNAP-IV; see [C-10](decision-log.md#conflicts-between-source-documents)). A screening tool, not a diagnosis.

Age gate
:   The rule that selects the screening instruments from the child's age when a case opens: 4 to 5 or 6 to 9.

Alert level
:   Low, Medium or Elevated, assigned per domain from its score. Stored as `LOW`, `MODERATE`, `HIGH`.

Anti-admission and anti-disciplinary firewall
:   Controls that stop Mirai data being used for admission, discipline, grade repetition or exclusion.

Append-only audit log
:   A log that only accepts new rows. Existing rows cannot be changed or deleted.

Application-layer encryption
:   Encrypting specific fields inside the application before they reach the database. Today only TOTP secrets; child and parent identity fields are planned.

Argon2
:   The password-hashing algorithm Mirai uses. The real password is never stored.

CAST
:   Childhood Autism Spectrum Test. The autism-domain instrument for all ages in Mirai.

Case
:   One screening-to-follow-up workflow for one student. A student can have many cases over time but only one unfinished case.

CBC
:   Competency Based Curriculum, Kenya's national curriculum.

CLDQ-R
:   Colorado Learning Difficulties Questionnaire, Revised. Mirai uses its Dyslexia Subscale for ages 6 to 9.

Combined score
:   The average of the teacher's and the parent's normalised scores for one domain.

Consent record
:   Proof that a parent agreed to their child's data being processed for pre-referral observation. Required before a child profile exists.

Discrepancy
:   A large difference between the teacher's and the parent's score in a domain. The decision is to treat it like an Elevated result; not built yet.

Domain
:   One of three independent areas: Autism, ADHD, Dyslexia.

Domain density score
:   The highest of a case's combined domain scores (0.00 to 3.00). A value of 2.00 or more opens the IEP pathway.

EARC
:   Educational Assessment and Resource Centre.

Elevated
:   The highest alert level (2.00 to 3.00). Unlocks the IEP, home activities and professional listing.

File Search Store
:   Gemini's managed retrieval store. In Mirai it holds KICD guidance and the activity bank, never child data.

Anchor questions
:   The teacher's short opening questions. A domain's full section opens only when its anchor answer is 2 or more.

Gemini
:   Google's large language model family, used through the Gemini API to draft IEPs and evaluation questions.

Human in the loop
:   A person must review and approve AI output before it becomes part of a record.

IDOR
:   Insecure Direct Object Reference: reaching another user's data by changing an id in a request.

IEP
:   Individualised Education Programme. In Mirai, an editable classroom support plan, drafted for review and approved by the teacher and school administrator.

Intake window
:   The fixed 7 days in which the teacher and parent complete their screenings for a case.

JWT
:   JSON Web Token. A signed token proving a user is signed in.

KDPA
:   Kenya Data Protection Act, 2019.

KICD
:   Kenya Institute of Curriculum Development.

KISE
:   Kenya Institute of Special Education.

Longitudinal record
:   A child's history of cases and outcomes that stays with the child, independent of which teacher created it.

MFA
:   Multi-factor authentication: signing in with more than one proof of identity.

Multi-tenant
:   Many schools share one platform, with each school's data kept separate.

No Concern Identified
:   The case outcome when no domain is Elevated and there is no qualifying discrepancy. No IEP is generated.

Non-diagnostic
:   Mirai records observations and never diagnoses or labels a child.

OWASP Top 10
:   A widely used list of the most serious web application security risks.

Pre-referral
:   The stage before a child is referred to a specialist, when observations are gathered and support is planned.

Professional directory
:   Psychologists and psychiatrists a family may choose to contact. Maintained by the system administrator.

PWA
:   Progressive Web App. A web application that installs and behaves like an app from a browser link.

RAG
:   Retrieval-Augmented Generation. The model looks up reference documents before writing.

RBAC
:   Role-Based Access Control. Each user can do only what their role allows.

Referral packet
:   *Planned:* the de-identified, encrypted document a parent may export and hand to a professional. Mirai never sends it on its own.

Report
:   The per-case summary for the parent: disclaimer, domain bands and meaning, recommendation, active IEP and professionals.

School administrator
:   The school director or headteacher role in Mirai.

SNAP-IV
:   Observational rating scale used for the ADHD domain at ages 6 to 9.

System administrator
:   The Mirai operator role that onboards schools and manages reference data.

TOTP
:   Time-based One-Time Password: the 6-digit code from an authenticator app.

UUID
:   Universally Unique Identifier. Random ids used as primary keys so records cannot be guessed.

Whitelisting
:   The school administrator creating or approving the teacher accounts that may use Mirai.

*[RBAC]: Role-Based Access Control
*[TOTP]: Time-based One-Time Password
*[IEP]: Individualised Education Programme
*[KICD]: Kenya Institute of Curriculum Development
*[KISE]: Kenya Institute of Special Education
*[PWA]: Progressive Web App

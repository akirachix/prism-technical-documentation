---
title: Home
description: Mirai helps early childhood teachers and parents in Nairobi document developmental concerns early, without diagnosis and without stigma.
hide:
  - navigation
  - toc
---

<div class="mi-hero" markdown>
<div class="mi-hero__inner" markdown>
<div markdown>

![Mirai](assets/brand/mirai-mark-light.png){ .mi-hero__logo }

<h1>Notice early.<br><span>Support sooner.</span></h1>

<span class="mi-hero__note">:material-shield-check-outline: A screening support tool. It never gives a diagnosis.</span>

Mirai is a mobile-first Progressive Web App that turns what Grade&nbsp;1 to Grade&nbsp;3 teachers and parents already notice into a structured, non-diagnostic record, so a child can reach support while intervention still works best.

[Start here](start-here/index.md){ .md-button .md-button--primary }
[See the architecture](architecture/index.md){ .md-button }

</div>
<div class="mi-hero__visual" markdown>

![Mirai teacher dashboard on a laptop](assets/brand/mockup-teacher-laptop.png)

![Mirai system administrator dashboard](assets/brand/mockup-admin-desktop.png)

![Mirai teacher sign-in and parent invitation on mobile](assets/brand/mockup-phones.png)

</div>
</div>
</div>

<div class="mi-stats" markdown>
<div class="mi-stat"><strong>34.9 months</strong><span>average gap in Kenya between a caregiver's first concern and a formal diagnosis</span></div>
<div class="mi-stat"><strong>~100,000</strong><span>Nairobi children estimated to be living with a neurodevelopmental difference, most in private schools</span></div>
<div class="mi-stat"><strong>3 domains</strong><span>Autism, ADHD and Dyslexia, scored independently so one concern is never diluted by another</span></div>
<div class="mi-stat"><strong>0 diagnoses</strong><span>Mirai documents and triangulates observations. Clinical labels are out of scope by design</span></div>
</div>

<h2 class="mi-home-h">How a case moves through Mirai</h2>

<p class="mi-home-sub">Every case starts with something a teacher noticed in class. Mirai gives that observation a structure, a second perspective and a next step.</p>

<div class="mi-steps" markdown>
<div class="mi-step" markdown>

#### Notice

A whitelisted teacher registers the child and opens a case. The child's age selects the screening instruments.

</div>
<div class="mi-step" markdown>

#### Screen

Teacher and parent each answer the same age-gated questions, one at a time, inside a 7-day window.

</div>
<div class="mi-step" markdown>

#### Score

A deterministic engine scores Autism, ADHD and Dyslexia from 0.00 to 3.00. No AI touches the numbers.

</div>
<div class="mi-step" markdown>

#### Support

An Elevated result unlocks an AI-drafted, KICD-grounded IEP that the teacher and school administrator must both approve.

</div>
<div class="mi-step" markdown>

#### Follow up

Six weeks after approval, teacher and parent rate progress on the plan's goals and the record carries forward.

</div>
</div>

<h2 class="mi-home-h">One platform, four roles</h2>

<div class="mi-showcase" markdown>
<figure markdown>

![Parent completing a screening question on a phone](assets/brand/mockup-parent-screening.png)

<figcaption>Parents answer from their own phone, in plain non-clinical language</figcaption>
</figure>
<figure markdown>

![School teacher dashboard on a laptop](assets/brand/mockup-teacher-laptop.png)

<figcaption>Teachers see who needs attention, open cases and review IEP drafts</figcaption>
</figure>
<figure markdown>

![System administrator dashboard](assets/brand/mockup-admin-imac.png)

<figcaption>Administrators onboard schools and watch aggregate, non-identifying metrics</figcaption>
</figure>
</div>

<h2 class="mi-home-h">What Mirai does</h2>

<div class="mi-grid mi-grid--3" markdown>

<div class="mi-card mi-card--red" markdown>
:material-account-child-outline:
### Age-gated intake
Ages 4 to 5 route to CAST and the ADHD Rating Scale IV Preschool Version. Ages 6 to 9 route to CAST, SNAP-IV and the CLDQ-R Dyslexia Subscale.
</div>

<div class="mi-card mi-card--orange" markdown>
:material-account-multiple-check-outline:
### Two perspectives per case
One teacher screening and one parent screening per case, driven by a finite state machine so question order is fixed and auditable.
</div>

<div class="mi-card mi-card--navy" markdown>
:material-calculator-variant-outline:
### Deterministic scoring
Fixed, published formulas produce Low, Medium or Elevated per domain. A case escalates if any single domain is Elevated.
</div>

<div class="mi-card mi-card--red" markdown>
:material-file-document-edit-outline:
### Curriculum-grounded IEPs
Gemini with a File Search Store drafts an editable plan from KICD inclusive education guidelines. Humans approve before it is used.
</div>

<div class="mi-card mi-card--orange" markdown>
:material-home-heart:
### Home activities and referral help
Parents get domain-matched home activities, a report they control, and a directory of psychologists and psychiatrists they may choose to contact.
</div>

<div class="mi-card mi-card--navy" markdown>
:material-shield-lock-outline:
### Privacy by design
Strict role-based access, tenant isolation per school, staff MFA, field-level encryption and an append-only audit log aligned to the Kenya Data Protection Act, 2019.
</div>

</div>

<div class="mi-banner" markdown>
:material-hand-heart-outline:

**Mirai never labels a child.** It structures what adults already observe, keeps a flagged child's status visible only to the people who must act on it, and leaves every referral decision with the family.

</div>

<h2 class="mi-home-h">Find your way</h2>

<div class="mi-grid" markdown>

<div class="mi-card mi-card--navy" markdown>
:material-compass-outline:
### [Start Here](start-here/index.md)
What Mirai is, the problem it solves, who it serves and the impact it aims for.
</div>

<div class="mi-card mi-card--red" markdown>
:material-sitemap-outline:
### [Architecture](architecture/index.md)
System layers, data flows, the case lifecycle and the data model.
</div>

<div class="mi-card mi-card--orange" markdown>
:material-function-variant:
### [Scoring Engine](backend/scoring-engine.md)
Age gating, the intake state machine, the domain formula and discrepancy handling.
</div>

<div class="mi-card mi-card--navy" markdown>
:material-security:
### [Security](security/index.md)
Access control, privacy, compliance and the threat model.
</div>

</div>


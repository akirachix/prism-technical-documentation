---
title: Users and Personas
description: Stakeholders, personas, jobs to be done and what each Mirai role can do.
---

# Users and Personas

<p class="mi-lead">Mirai serves four signed-in roles inside one Progressive Web App, plus external professionals who only ever receive what a parent chooses to share.</p>

## Stakeholder map

| Group | Who | Why they matter |
| --- | --- | --- |
| **Players** | School directors and headteachers | Control onboarding, staff accounts and consent governance. They decide whether a school adopts Mirai. |
| **Context setters** | Ministry of Education, Ministry of Health, KICD, KISE | Set the regulatory and professional legitimacy that field research named as a precondition for adoption. KISE is a destination for the referral packet. |
| **Subjects** | Early childhood classroom teachers (Grade 1 to Grade 3) | The frontline observers. They define Mirai's primary persona. |
| **Crowds** | Parents and caregivers; pro bono psychologists and psychiatrists | Parents complete the parallel screening and decide whether to act. Professionals receive contact from families who choose to reach out. |

## Personas

<div class="mi-grid mi-grid--2" markdown>

<div class="mi-card mi-card--red" markdown>
:material-human-male-board:
### Mwalimu Beatrice, the educator
**34 · Grade 2 classroom teacher · medium tech confidence**

Manages an overcrowded class with heavy CBC paperwork and no special-needs training. She spots persistent processing gaps in some children but has no official channel to record them. Raising it at pick-up gets defensive push-back.

**Wants:** to log concerns safely and gradually without adding to her workload, and to get practical classroom strategies that help without isolating the child.
</div>

<div class="mi-card mi-card--orange" markdown>
:material-human-female-boy:
### Grace Wanjiku, the caregiver
**29 · Small business owner · mobile-first**

Fears her child being labelled "disabled" by family and neighbours. Has noticed small delays at home but hopes it is a phase. Cannot afford speculative assessments and feels cornered by uncoordinated complaints from school.

**Wants:** a private, gentle conversation about her child on her own phone, control over who sees the data, and a transparent view of costs before going to a clinic.
</div>

<div class="mi-card mi-card--navy" markdown>
:material-school-outline:
### John, the headteacher
**55 · School headteacher / director · manages a web dashboard**

Has no school-wide view of how many children may need support, which makes training and budget planning guesswork.

**Wants:** to manage teacher access and consent records without error-prone manual work, and to see aggregate caseload numbers while being structurally unable to misuse an individual child's raw data.
</div>

</div>

## Jobs to be done

| Persona | When... | I want to... | So that... |
| --- | --- | --- | --- |
| Beatrice | a student keeps falling behind in specific sub-strands | quickly log those variances from my phone | there is an objective history that survives class handovers |
| Grace | the school starts a learning check for my child | answer simple questions on my own device without clinical labels | I can describe my child privately, without fear or stigma |
| John | I plan training or report on inclusive education | see how many cases are being tracked, in aggregate | I can plan and account for support needs |
| John | a new teacher takes over a class | the child's history is already in a persistent digital record | continuity of support does not depend on who stays |

## What each role can do

| Capability | Teacher | Parent | School admin | System admin |
| --- | :---: | :---: | :---: | :---: |
| Sign in with email and password | :material-check: | :material-check: | :material-check: | :material-check: |
| Second factor at sign-in | TOTP app | TOTP app | TOTP app | TOTP app |
| Onboard schools and first school admin | | | | :material-check: |
| Create and revoke teacher accounts | | | :material-check: | |
| Invite parents | :material-check: | | | |
| Register students and open cases | :material-check: (own class) | | | |
| Complete a screening | :material-check: | :material-check: | | |
| See their own child's report | | :material-check: | | |
| Edit and submit an IEP draft | :material-check: | | | |
| Approve or reject an IEP | :material-check: | | :material-check: | |
| View an approved IEP | :material-check: | :material-check: | :material-check: | |
| Export the referral packet | | :material-check: | | |
| Complete the six-week check | :material-check: | :material-check: | | |
| Read audit events | | | Own school | All |
| Maintain professional directory and templates | | | | :material-check: |
| See raw screening answers of the other informant | | | | |

The authoritative version of this matrix, with the API-level rules behind it, is in [Access Control](../security/access-control.md).

## Devices and context

- **Teachers** typically use entry-level Android phones (for example a Tecno Spark with full storage) and keep mobile data off during class to save money. Mirai must run in the browser with no install and tolerate dropped connections.
- **Parents** are comfortable with WhatsApp and SMS and prefer a browser link to installing an app: in the August 2026 survey, 34 of 42 parents (about 81%) chose a browser-based experience.
- **School administrators** mostly work from a laptop or desktop, so the admin experience is designed desktop-first with the same PWA.

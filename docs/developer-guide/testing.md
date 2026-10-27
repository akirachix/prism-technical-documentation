---
title: Testing and QA
description: Mirai's verification strategy - test levels, priority scenarios, test data, release criteria and defect severity.
---

# Testing and QA

<p class="mi-lead">Testing focuses on the failures that could hurt a child: wrong escalation, missed escalation, exposed data, bypassed consent, or AI influencing a score.</p>

!!! info "Scope of these tests"

    These tests check that Mirai **implements its approved rules correctly**. They do not establish the clinical validity, sensitivity or specificity of the screening instruments, because Mirai is explicitly non-diagnostic.

## Test suites in the code

The strategy below is what the tests aim to cover. These are the automated suites that exist today.

| Repository | Framework | Location | Size | Run it |
| --- | --- | --- | --- | --- |
| `prism-backend` | pytest (+ pytest-cov) on in-memory SQLite | `tests/` (`conftest.py` sets `DATABASE_URL=sqlite://`) | 31 test files | `uv run --no-sync pytest --cov --cov-report=term-missing` |
| `prism-frontend` | Jest + React Testing Library | `tests/components/`, `tests/lib/`, `tests/notifications/` | 29 test files | `npm run test` |
| `prism-dashboard` | Jest + React Testing Library | `tests/api/`, `tests/auth/`, `tests/professionals/`, `tests/schools/`, `tests/school-admin/`, `tests/system-admin/`, `tests/ui/`, `tests/utils/` | 38 test files | `npm run test` |

Backend tests refuse to run against a non-SQLite database (`database.py`), so they never touch a real database. On pull requests, `ci.yml` runs the backend suite with coverage (backend README).

Examples of what the backend suite checks, by file:

| File | Checks |
| --- | --- |
| `tests/test_screening_rules.py`, `tests/test_domain_score.py` | Age gating, item scoring, scaling to 0 to 3, rounding, combining teacher and parent scores |
| `tests/test_auth.py`, `tests/test_security.py` | Sign-in stages, lockout, token scopes and revocation, password hashing, TOTP |
| `tests/test_parent_access.py` | A parent cannot read another family's case |
| `tests/test_ai.py`, `tests/test_ai_evaluation_questions.py` | AI jobs, names and condition words rejected, missing references |
| `tests/test_iep.py`, `tests/test_iep_evaluation_window.py` | Dual approval and the six-week unlock |
| `tests/test_migrations.py` | Migrations apply cleanly |

## Key verification risks

| Risk | Example |
| --- | --- |
| Incorrect escalation | A score of 1.99 classified as Elevated, starting an unnecessary support pathway |
| Missed escalation | A score of 2.00 classified as Medium |
| Incorrect discrepancy handling | A large teacher and parent gap fails to trigger the Elevated pathway |
| Unauthorised access | A teacher reads another class's case |
| Cross-school leakage | School A retrieves School B's data by changing an id |
| AI influence on scoring | An AI outage or output changes a score or level |
| Diagnostic AI language | A draft says a child "has ADHD" |
| Consent failure | A child profile is created without consent |
| Unauthorised export or lifecycle action | A teacher exports the referral packet |

## Test levels

| Level | Focus | Owner |
| --- | --- | --- |
| Unit / component | Scoring formulas, age gate, permission checks, packet helpers, state machine transitions, discrepancy and threshold boundaries | Developers |
| Integration | PWA and API; parent channel and case; admin and teacher management; scoring and API; AI service and File Search; export pipeline | Developers + QA |
| System / end-to-end | Consent, open case, two screenings, lock, score, discrepancy, plan draft, review, packet, follow-up | QA |
| Security | Role and tenant isolation, anti-admission firewall, auth, TLS, API authorisation, export encryption, audit | QA + security review |
| Usability / acceptance | Teacher flow under time pressure, parent clarity, no-install access, director metrics view, consent flow, generated content readability | Product + pilot schools |

## Priority scenarios

Scenario ids match the QA Discovery and Test Strategy document. **Critical** means a failure could expose child data, bypass consent or authorisation, corrupt scoring, allow an unauthorised export, let AI influence scoring, or break a child's support pathway.

??? danger "Age gate and case initiation (AGE, CASE)"

    | Id | Scenario |
    | --- | --- |
    | AGE-01 | Ages 4 and 5 route to CAST + ADHD RS-IV Preschool |
    | AGE-02 | Ages 6 to 9 route to CAST + SNAP-IV + CLDQ-R |
    | AGE-03 | Dyslexia not scored for the 4 to 5 pathway |
    | AGE-04 | Ages outside 4 to 9 rejected |
    | AGE-05 | Exactly 6 routes to the 6 to 9 pathway |
    | AGE-06 | Age calculated from date of birth |
    | AGE-07, CASE-01, CASE-03 | Never more than one unfinished case, including concurrent requests |
    | CASE-02 | No Elevated domain and no discrepancy closes as No Concern Identified, no IEP |

??? danger "Consent (CON)"

    | Id | Scenario |
    | --- | --- |
    | CON-01, CON-02 | Profile creation requires a valid consent record; otherwise rejected |
    | CON-03 | Consent tied to the correct child, parent and school |
    | CON-04 | Cannot be bypassed through the API or client state |
    | CON-05 | Withdrawal follows the approved lifecycle rule |

??? danger "Intake (INT)"

    | Id | Scenario |
    | --- | --- |
    | INT-01, INT-02 | Independent workflows; one informant cannot edit the other's answers |
    | INT-03 to INT-06 | Window opens and closes correctly; responses lock; deadline boundary respected |
    | INT-07 to INT-10 | Both, only teacher, only parent, or neither completes |
    | INT-11, INT-12 | Deterministic question sequence; invalid answers never advance state |
    | INT-13 to INT-16 | Offline queue: correct association after reconnect, no duplicates, late replays rejected, no overwrite of newer answers |

??? danger "Scoring and discrepancy (SCR, DIS)"

    | Id | Scenario |
    | --- | --- |
    | SCR-01 to SCR-04 | Server-side formula; domains independent; never blended; reference inputs give expected outputs |
    | SCR-06, SCR-07, SCR-15 | 2.00 and 3.00 are Elevated |
    | SCR-12 to SCR-14 | 1.00 Low; 1.01 and 1.99 Medium |
    | SCR-09 | Any Elevated domain makes the case Elevated |
    | SCR-10, SCR-11 | Client or AI cannot change a score |
    | SCR-16 | Values outside 0 to 3 rejected |
    | DIS-01 to DIS-10 | Below, at and above the threshold; same downstream path as Elevated; independent of AI; missing side not treated as zero |

??? danger "AI and IEP (AI)"

    | Id | Scenario |
    | --- | --- |
    | AI-01, AI-12 | Generation blocked before Elevated or discrepancy, even through the API |
    | AI-02, AI-03, AI-10 | AI cannot modify scores or the alert; outage leaves them unchanged |
    | AI-04 | Draft until approvals complete |
    | AI-05 | No diagnostic statements |
    | AI-06, AI-13 | Activities match the domain and use household materials |
    | AI-07, AI-08, AI-09 | Generation audited; 3 attempts then 24-hour cooldown |
    | AI-11, AI-15 | Approved KICD sources only; references recorded; no child data to retrieval |

??? danger "Reports and export (EXP)"

    | Id | Scenario |
    | --- | --- |
    | EXP-01 to EXP-03 | Approved structure; de-identified; encrypted |
    | EXP-04 to EXP-07 | Parent-only export; teacher, admin and anonymous users blocked |
    | EXP-08, EXP-09 | Export audited; never presented as a diagnosis |
    | EXP-10 to EXP-14 | Not built from incomplete screenings; one report per case; regeneration replaces in place |

??? danger "Access, tenancy and onboarding (SEC, ONB)"

    | Id | Scenario |
    | --- | --- |
    | SEC-01 to SEC-03 | Teachers and parents limited to their own scope |
    | SEC-04, SEC-05, SEC-09 | School admins limited to permitted views; never raw answers |
    | SEC-06, SEC-07 | No client-side privilege escalation; API enforces UI rules |
    | SEC-08 | School A cannot read School B |
    | SEC-10, SEC-11 | Flagged status undiscoverable; packet access limited to the parent |
    | SEC-12 to SEC-14 | Only system admin archives or purges; TLS only; server-only scoring |
    | ONB-01 to ONB-04 | School creation, teacher whitelisting, student registration, non-whitelisted teachers blocked |

??? danger "Evaluation, longitudinal record and compliance (EVAL, LONG, COMP)"

    | Id | Scenario |
    | --- | --- |
    | EVAL-01, EVAL-02 | Unlock = final approval + 6 weeks; closed before that, including via API |
    | EVAL-03 to EVAL-07 | Questions from short-term goals; only -2 to 2 accepted; completed only when both answer all |
    | LONG-01, LONG-02 | Record follows the child across teacher changes and transfers |
    | COMP-01, COMP-02 | Purpose limits; non-diagnostic language everywhere |
    | COMP-03 to COMP-06 | Audit metadata complete, no personal content, immutable, school-scoped |
    | COMP-07 to COMP-10 | Revocation works and is logged; corrections authorised without altering history; retention policy followed |

## Test design techniques

The QA workbook combines three techniques:

**Decision tables.** For example, IEP activation:

| Condition / action | R1 | R2 | R3 | R4 |
| --- | :---: | :---: | :---: | :---: |
| `teacher_approved` | N | Y | N | Y |
| `admin_approved` | N | N | Y | Y |
| `approved_at` set | No | No | No | **Yes** |
| `evaluation_unlock_date` set | No | No | No | **+6 weeks** |
| Case status | `IEP_PENDING_APPROVAL` | `IEP_PENDING_APPROVAL` | `IEP_PENDING_APPROVAL` | **`IEP_ACTIVE`** |

**Boundary value analysis.** For example:

| Field | Limit | Test values |
| --- | --- | --- |
| Child age | 4 to 9 completed years | 3y 11m (reject), 4y 0d, 6y, 9y 11m (accept), 10y 0d (reject) |
| Domain score | Low ≤ 1.00 < Medium < 2.00 ≤ Elevated | 1.00, 1.01, 1.99, 2.00 |
| Evaluation score | -2 to 2 | -3 (reject), -2, 0, 2 (accept), 3 (reject) |
| `first_name` | max 100 characters | 100 (accept), 101 (reject) |
| `school.name` | max 150 characters | 150 (accept), 151 (reject) |

**Matrix test cases.** The QA workbook holds **249 test cases** in eleven modules: School, Users and Sign-in; Student Registration; Case Management; Screening; Scoring; IEP Generation and Approval; Evaluation; Recommendation; Audit Log; Access Control and Data Protection; PWA, Usability and Accessibility. Each case is grouped by module and category (Positive, Negative, Boundary, Security, UI) with the columns: User Stories, Acceptance Criteria, Test Case ID, Title, Requirement ID, Priority, Severity, Automation, Preconditions, Test Steps, Test Data, Expected Result.

## Test data

- Development and CI: **synthetic data only**.
- Staging: synthetic or anonymised learner profiles; mirrors production configuration.
- No production child data in any automated suite.
- Data sets cover age boundaries, Low / Medium / Elevated results, agreement and discrepancy, incomplete intake, consent withdrawal, rejected drafts, regeneration, export, transfer and follow-up, across **at least two schools**.

## Entry criteria

1. Open decisions resolved or given approved interim values (see the [Decision Log](../reference/decision-log.md)).
2. A stable staging build with the scoring engine, age gate, consent gate, intake window and RBAC.
3. Synthetic data sets loaded.
4. AI service available in staging, or a controlled stub.
5. Auth, HTTPS and authorisation working and instrumented for audit checks.
6. Product owner confirms the release-candidate baseline.

## Exit criteria

A release candidate goes to product-owner sign-off only when, among others:

- [ ] All Critical scenarios pass; High scenarios pass or have an accepted, documented risk.
- [ ] No unresolved Critical security finding and no cross-school or cross-child leakage.
- [ ] Age-gate boundaries (including exactly 6) and the scoring reference suite pass.
- [ ] Discrepancy tests pass at the approved threshold.
- [ ] Consent and parent-only export cannot be bypassed through UI or API.
- [ ] AI cannot change scores; generated content is non-diagnostic and stays draft until approved; regeneration limits hold.
- [ ] Audit events are recorded, complete and immutable.
- [ ] One unfinished case per student holds under concurrency.
- [ ] Offline sync preserves valid answers and enforces the 7-day deadline.
- [ ] Six-week evaluation unlock, score range and completion rules verified.

## Defect severity

| Severity | Definition |
| --- | --- |
| **Critical** | Could expose child data, bypass consent or authorisation, allow cross-school access, alter scoring or alerts, allow unauthorised export, let AI influence scoring, or make generated content present a diagnosis |
| **High** | A major workflow fails or materially incorrect information appears, without meeting Critical |
| **Medium** | A supporting workflow, usability or non-critical function is affected; core controls intact |
| **Low** | Minor wording, layout or presentation issue |

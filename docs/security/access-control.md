---
title: Access Control
description: Mirai's role-based access matrix, tenant isolation and the anti-admission firewall.
---

# Access Control

<p class="mi-lead">Four roles with non-overlapping privileges, every query scoped to a school, and a hard rule that a flagged child's status is visible only to the people who must act on it.</p>

## The visibility rule

> No feature may make a flagged child's status visible to anyone other than the child's own **teacher**, the child's **parent**, the **school administrator** (for IEP approval and the student report) and, after the parent exports, the **receiving clinical body**.

This is a **hard access-control requirement, not a configuration default**. It reflects the research finding that the participating school already supports children discreetly, without marking them as different.

## Role matrix

| Resource | Teacher | Parent | School admin | System admin |
| --- | --- | --- | --- | --- |
| Schools | Own (read) | | Own (read, update) | All (create, update, deactivate) |
| Teacher accounts | Self | | Create, view, revoke (own school) | Create first school admin |
| Parent accounts | Create, re-invite (for own students) | Self | View (own school) | |
| Students | Own class (create, read) | Own children (read) | Own school (read, list) | |
| Cases | Own class (open, read, close) | Own children (read status) | Own school (read status) | |
| Own screening answers | Write while window is open | Write while window is open | | |
| Other informant's answers | **No** | **No** | **No** | **No** |
| Domain scores | Status and levels | Through the report | Three scores, while an IEP awaits their approval | |
| Report | <span class="mi-verify">see note</span> | Own child | <span class="mi-verify">see note</span> | |
| IEP draft | Create, edit (initiating teacher), submit, approve, reject | | Approve, reject (own school) | |
| Approved IEP | Read | Read | Read | |
| Referral packet export | **No** | **Own child only** | **No** | **No** |
| Home activities and professionals | Read | Read | | Manage directory and templates |
| Evaluation | Answer | Answer | | |
| Longitudinal record | Any currently whitelisted teacher at the school | Own child | | |
| Audit log | | | Own school | All |
| Platform metrics | | | School aggregates | Platform aggregates |
| Question bank, interpretations, templates | | | | Manage |

!!! note "Report visibility: open point"

    The data model says only the parent can open the report. The Technical Requirements and the QA strategy say the school administrator can view reports of students in their own school. Until resolved, implement the stricter rule (parent only) and track it in the [Decision Log](../reference/decision-log.md).

## How it is enforced

```mermaid
flowchart LR
    R[Request] --> A{Valid JWT?<br/>not revoked,<br/>token_version current}
    A -- no --> E401[401]
    A -- yes --> B{Role allowed<br/>on this route?}
    B -- no --> E403[403]
    B -- yes --> C{Record in caller's<br/>school and relationship?}
    C -- no --> E404[404]
    C -- yes --> D[Role-specific<br/>response model]
    D --> L[Audit row]
```

| Layer | Mechanism |
| --- | --- |
| Route | `require_role(...)` dependency on every protected route |
| Tenant | `school_id` from the token, never from the request body; queries filtered by it |
| Relationship | Teacher must be `student.teacher_id`; parent must be `student.parent_id` |
| Projection | Separate Pydantic response models per role; the admin model has no field for raw answers or plan narrative outside approval |
| Database | Partial unique index for one unfinished case; audit table insert-only; check constraint tying `SYSTEM_ADMIN` to a null school |
| IDs | Random UUIDs in paths; out-of-scope records return `404` |

## Tenant isolation

- One shared schema; `school_id` on `user`, `student` and `case`.
- Every other record is reached **through the student**, so a correct student filter scopes everything below it.
- Tests create at least two schools and assert that no endpoint returns School B's data to a School A token (SEC-08).
- Deactivating a school (`is_active = false`) blocks sign-in for all of its users.

## Anti-admission and anti-disciplinary firewall

| Control | Detail |
| --- | --- |
| No admissions or discipline features | Mirai has no workflow, export or report designed for admission, placement or discipline decisions |
| No automated actions | No score or flag triggers an administrative action; every downstream step needs a human, parent-consented decision |
| Transfer protection | A record is never visible during a school-transfer or admissions process unless the parent exports it |
| Admin limits | School administrators cannot open raw answers or download raw observation logs |
| Aggregates only | Institutional metrics cannot be de-aggregated to an individual child |

## Staff lifecycle

1. **Joiner:** the school administrator creates the teacher with a temporary password; first sign-in forces a new password and TOTP setup.
2. **Mover:** students are reassigned to another teacher; the record stays with the student.
3. **Leaver:** the school administrator revokes access. `is_active = false`, `token_version` is raised, all sessions end immediately. The roster is reassigned within 30 days; after that, the account's personal details are deleted and only the pseudonymous UUID remains in audit logs.

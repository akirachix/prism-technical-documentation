---
title: User Flows
description: Teacher, parent, school administrator and AI system flows for Mirai.
---

# User Flows

<p class="mi-lead">The four flows designed by Team Prism in FigJam, with notes on how each maps to the implementation.</p>

!!! tip "Source"

    The editable boards live in the team's FigJam file *Prism User flows*. Click any image to zoom.

=== "Teacher"

    ![Teacher user flow: receive invite, sign in with 2FA, enter child details and invite parent, answer pathway questions, scoring, request IEP draft, approve or regenerate, admin approval, plan added to record, wait for next screening](../assets/flows/teacher-user-flow@3x.webp){ .zoomable .mi-w-md }

    | Step | What happens | Implementation note |
    | --- | --- | --- |
    | Receive account | School administrator creates the account with a temporary password | `user.must_change_password = true` |
    | First sign-in | Set a new password and enrol Google Authenticator | TOTP verified server-side; later sign-ins ask for the 6-digit code |
    | Register child, invite parent | Enter the child's details and link or invite the parent | Parent must exist before the student; consent required |
    | Screening | Questions for each pathway (autism, dyslexia, ADHD) routed by age | Anchor questions open each domain's section; one question per screen ([Scoring Engine](../backend/scoring-engine.md#planning-a-screening)) |
    | Scoring | Answers go to the scoring module | Deterministic, server-side only |
    | Elevated? | If not, monitor and continue; if yes, request an IEP draft | The teacher requests the draft; the score gate is *planned* ([IEP Generation](../ai/iep-generation.md#when-generation-is-allowed)) |
    | Review | Approve, edit or regenerate | Regeneration limit *planned* (3, then 24-hour cooldown) |
    | Admin approval | School administrator approves or sends back | Both approvals make the plan active |
    | Plan added to record | Six-week check scheduled | `evaluation_unlock_date = approved_at + 6 weeks` |

=== "Parent"

    ![Parent user flow: invitation from teacher, accept or token expires, sign in with 2FA, answer pathway questions, scoring, elevated alert or not, report with recommendations and activities, download report](../assets/flows/parent-user-flow@3x.webp){ .zoomable .mi-w-sm }

    | Step | What happens | Implementation note |
    | --- | --- | --- |
    | Invitation | Teacher onboards the parent; an invitation arrives by email | Single-use, expiring token via Resend / SMTP |
    | Accept or expire | An expired invitation ends the flow; the teacher can resend | "Resend invite" on the teacher's To do list |
    | Sign in | Password plus a second factor | TOTP authenticator app, enrolled at first sign-in, the same as staff (`services/auth.py`) |
    | Screening | Same questions, non-clinical and non-deficit wording | Starts after the teacher has finished (`PARENT_TURN` notification) |
    | Result | Report, plus recommendations and home activities when a domain is Medium or Elevated | Report built deterministically from stored scores |
    | Download | Parent may download the report or export the referral packet | Parent-only export, audited |

=== "School administrator"

    ![School admin user flow: receive school onboarding, create admin account with 2FA, whitelist teachers; view IEP approval requests and approve, edit or reject; view metrics; view staff profiles and revoke access when staff leave](../assets/flows/school-admin-user-flow@3x.webp){ .zoomable .mi-w-md }

    | Branch | What happens | Implementation note |
    | --- | --- | --- |
    | Onboarding | Receives the school onboarding from the system administrator, sets up the account with 2FA, whitelists teachers | Teacher accounts created by the school admin only |
    | IEP approvals | Reviews and approves or rejects IEP drafts | Can read the draft and the three domain scores; never raw answers |
    | Metrics | Views school-level, non-identifying metrics | Aggregates only |
    | Staff | Views staff profiles; revokes access when someone leaves | `is_active = false`, `token_version` raised, sessions end |

=== "AI system"

    ![AI system flow: backend scores, elevated or discrepancy check, RAG retrieves KICD curriculum and IEP guidelines, LLM writes support plan, teacher and admin review, regenerate up to three times then wait 24 hours, plan saved with audit trail](../assets/flows/ai-system-flow@3x.webp){ .zoomable .mi-w-sm }

    | Step | What happens | Implementation note |
    | --- | --- | --- |
    | Gate | Elevated score or IEP draft requested? | Checked against the stored `domain_score`, not the client |
    | Retrieve | RAG pulls KICD curriculum and IEP guidance | Gemini File Search Store; chunk references saved |
    | Write | LLM drafts the support plan | Output validated against a JSON schema and a diagnostic-language guard |
    | Review | Teacher, then school administrator | Rejection or edit can trigger regeneration |
    | Limit | More than three regenerations in this cycle? | Wait 24 hours |
    | Save | Approved plan saved with an audit trail | `GENERATE` and `APPROVE` audit actions |

## Design artefacts

The wireframes evolved from low-fidelity layouts (left) to the hi-fi Mirai screens (right) for the teacher mobile app, the parent PWA, the school administrator portal and the system administrator console.

![Wireframes on the left, hi-fi screens on the right: sign-in, OTP, home, students, journey, screening, schools, dashboards, IEP, evaluation, logout](../assets/design/wireframes-to-hifi@2x.webp){ .zoomable .mi-w-lg }

See [Screens](../frontend/screens.md) for the individual hi-fi screens.

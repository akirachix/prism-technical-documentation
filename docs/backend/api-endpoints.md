---
title: Endpoint List
description: Every route in the Mirai API, generated from the backend routers.
---

# Endpoint List

<p class="mi-lead">Generated from <code>prism-backend</code> at commit <code>unknown (not a git checkout)</code> by <code>scripts/generate_api_reference.py</code>. Do not edit by hand; re-run the script after backend changes.</p>

**123 routes.** The *Auth* column shows the dependency on the route itself. Role checks inside services are listed in [Access Control](../security/access-control.md).

!!! danger "45 routes have no authentication"

    These routes accept requests without an access token. They are marked **None** below. See the [Implementation Status](../reference/implementation-status.md#security-gaps).


## AI

| Method | Path | Auth | Rate limited | Handler |
| --- | --- | --- | --- | --- |
| `POST` | `/ai/cases/{case_id}/iep` | Signed in |  | `routers/ai.py:20` `start_iep_generation` |
| `POST` | `/ai/cases/{case_id}/recommendation` | Signed in |  | `routers/ai.py:36` `start_recommendation_generation` |
| `POST` | `/ai/ieps/{iep_id}/evaluation-questions` | Signed in |  | `routers/ai.py:52` `start_evaluation_questions` |
| `GET` | `/ai/jobs/{job_id}` | Signed in |  | `routers/ai.py:64` `get_job` |

## Audit Logs

| Method | Path | Auth | Rate limited | Handler |
| --- | --- | --- | --- | --- |
| `GET` | `/audit-logs` | Signed in |  | `routers/audit_log.py:27` `list_audit_logs` |
| `POST` | `/audit-logs` | Signed in |  | `routers/audit_log.py:18` `create_audit_log` |
| `GET` | `/audit-logs/{audit_id}` | Signed in |  | `routers/audit_log.py:56` `get_audit_log` |

## Authentication

| Method | Path | Auth | Rate limited | Handler |
| --- | --- | --- | --- | --- |
| `POST` | `/auth/accept-invitation` | Public (token or step token in body) | Yes | `routers/auth.py:95` `accept_invitation` |
| `POST` | `/auth/change-password` | Public (token or step token in body) | Yes | `routers/auth.py:41` `change_password` |
| `POST` | `/auth/forgot-password` | Public (token or step token in body) | Yes | `routers/auth.py:103` `forgot_password` |
| `POST` | `/auth/login` | Public | Yes | `routers/auth.py:35` `login` |
| `POST` | `/auth/logout` | Signed in |  | `routers/auth.py:78` `logout` |
| `GET` | `/auth/me` | Signed in |  | `routers/auth.py:89` `me` |
| `POST` | `/auth/mfa/enroll` | Public (token or step token in body) | Yes | `routers/auth.py:49` `mfa_enroll` |
| `POST` | `/auth/mfa/enroll/confirm` | Public (token or step token in body) | Yes | `routers/auth.py:57` `mfa_enroll_confirm` |
| `POST` | `/auth/mfa/verify` | Public (token or step token in body) | Yes | `routers/auth.py:65` `mfa_verify` |
| `POST` | `/auth/refresh` | Public (token or step token in body) | Yes | `routers/auth.py:73` `refresh` |
| `POST` | `/auth/reset-password` | Public (token or step token in body) | Yes | `routers/auth.py:116` `reset_password` |

## Cases

| Method | Path | Auth | Rate limited | Handler |
| --- | --- | --- | --- | --- |
| `GET` | `/cases` | Signed in |  | `routers/case.py:26` `list_cases` |
| `POST` | `/cases` | Signed in |  | `routers/case.py:17` `create_case` |
| `DELETE` | `/cases/{case_id}` | Signed in |  | `routers/case.py:80` `delete_case` |
| `GET` | `/cases/{case_id}` | Signed in |  | `routers/case.py:51` `get_case` |
| `PATCH` | `/cases/{case_id}` | Signed in |  | `routers/case.py:60` `update_case` |
| `POST` | `/cases/{case_id}/close` | Signed in |  | `routers/case.py:70` `close_case` |

## Domain scores

| Method | Path | Auth | Rate limited | Handler |
| --- | --- | --- | --- | --- |
| `GET` | `/domain-scores/case/{case_id}` | **None** :material-alert: |  | `routers/domain_score.py:14` `preview_scores` |
| `POST` | `/domain-scores/case/{case_id}/calculate` | **None** :material-alert: |  | `routers/domain_score.py:19` `calculate_scores` |

## IEP evaluation questions

| Method | Path | Auth | Rate limited | Handler |
| --- | --- | --- | --- | --- |
| `GET` | `/iep-evaluation-questions` | Signed in |  | `routers/iep_evaluation_question.py:100` `list_questions` |
| `POST` | `/iep-evaluation-questions` | Signed in |  | `routers/iep_evaluation_question.py:45` `create_question` |
| `POST` | `/iep-evaluation-questions/bulk` | Signed in |  | `routers/iep_evaluation_question.py:62` `create_questions` |
| `GET` | `/iep-evaluation-questions/current` | Signed in |  | `routers/iep_evaluation_question.py:121` `current_evaluation` |
| `POST` | `/iep-evaluation-questions/generate` | Signed in |  | `routers/iep_evaluation_question.py:82` `generate_questions` |
| `DELETE` | `/iep-evaluation-questions/{eval_question_id}` | Signed in |  | `routers/iep_evaluation_question.py:170` `delete_question` |
| `GET` | `/iep-evaluation-questions/{eval_question_id}` | Signed in |  | `routers/iep_evaluation_question.py:137` `get_question` |
| `PATCH` | `/iep-evaluation-questions/{eval_question_id}` | Signed in |  | `routers/iep_evaluation_question.py:153` `update_question` |

## IEP evaluation responses

| Method | Path | Auth | Rate limited | Handler |
| --- | --- | --- | --- | --- |
| `GET` | `/iep-evaluation-responses` | Signed in |  | `routers/iep_evaluation_response.py:52` `list_responses` |
| `POST` | `/iep-evaluation-responses` | Signed in |  | `routers/iep_evaluation_response.py:29` `create_response` |
| `POST` | `/iep-evaluation-responses/submit` | Signed in |  | `routers/iep_evaluation_response.py:43` `submit_evaluation` |
| `DELETE` | `/iep-evaluation-responses/{eval_response_id}` | Signed in |  | `routers/iep_evaluation_response.py:86` `delete_response` |
| `GET` | `/iep-evaluation-responses/{eval_response_id}` | Signed in |  | `routers/iep_evaluation_response.py:67` `get_response` |
| `PATCH` | `/iep-evaluation-responses/{eval_response_id}` | Signed in |  | `routers/iep_evaluation_response.py:76` `update_response` |

## IEPs

| Method | Path | Auth | Rate limited | Handler |
| --- | --- | --- | --- | --- |
| `GET` | `/ieps` | **None** :material-alert: |  | `routers/iep.py:31` `list_ieps` |
| `POST` | `/ieps` | **None** :material-alert: |  | `routers/iep.py:26` `create_iep` |
| `GET` | `/ieps/case/{case_id}/active` | **None** :material-alert: |  | `routers/iep.py:45` `get_active_iep_for_case` |
| `DELETE` | `/ieps/{iep_id}` | **None** :material-alert: |  | `routers/iep.py:102` `delete_iep` |
| `GET` | `/ieps/{iep_id}` | **None** :material-alert: |  | `routers/iep.py:50` `get_iep` |
| `PATCH` | `/ieps/{iep_id}` | **None** :material-alert: |  | `routers/iep.py:55` `update_iep` |
| `POST` | `/ieps/{iep_id}/approve` | **None** :material-alert: |  | `routers/iep.py:68` `approve_iep` |
| `POST` | `/ieps/{iep_id}/reject` | **None** :material-alert: |  | `routers/iep.py:97` `reject_iep` |
| `POST` | `/ieps/{iep_id}/submit` | **None** :material-alert: |  | `routers/iep.py:60` `submit_iep` |

## Notifications

| Method | Path | Auth | Rate limited | Handler |
| --- | --- | --- | --- | --- |
| `GET` | `/notifications` | Signed in |  | `routers/notification.py:31` `list_notifications` |
| `POST` | `/notifications` | Signed in |  | `routers/notification.py:22` `create_notification` |
| `POST` | `/notifications/read-all` | Signed in |  | `routers/notification.py:54` `mark_all_read` |
| `GET` | `/notifications/unread-count` | Signed in |  | `routers/notification.py:46` `unread_count` |
| `DELETE` | `/notifications/{notification_id}` | Signed in |  | `routers/notification.py:81` `delete_notification` |
| `GET` | `/notifications/{notification_id}` | Signed in |  | `routers/notification.py:62` `get_notification` |
| `PATCH` | `/notifications/{notification_id}` | Signed in |  | `routers/notification.py:71` `update_notification` |

## Professionals

| Method | Path | Auth | Rate limited | Handler |
| --- | --- | --- | --- | --- |
| `GET` | `/professionals` | **None** :material-alert: |  | `routers/professional.py:24` `list_professionals` |
| `POST` | `/professionals` | **None** :material-alert: |  | `routers/professional.py:19` `create_professional` |
| `DELETE` | `/professionals/{professional_id}` | **None** :material-alert: |  | `routers/professional.py:54` `delete_professional` |
| `GET` | `/professionals/{professional_id}` | **None** :material-alert: |  | `routers/professional.py:40` `get_professional` |
| `PATCH` | `/professionals/{professional_id}` | **None** :material-alert: |  | `routers/professional.py:45` `update_professional` |

## Recommendations

| Method | Path | Auth | Rate limited | Handler |
| --- | --- | --- | --- | --- |
| `GET` | `/recommendations` | **None** :material-alert: |  | `routers/recommendation.py:23` `list_recommendations` |
| `POST` | `/recommendations` | **None** :material-alert: |  | `routers/recommendation.py:18` `create_recommendation` |
| `GET` | `/recommendations/case/{case_id}` | **None** :material-alert: |  | `routers/recommendation.py:33` `get_recommendation_for_case` |
| `DELETE` | `/recommendations/{recommendation_id}` | **None** :material-alert: |  | `routers/recommendation.py:52` `delete_recommendation` |
| `GET` | `/recommendations/{recommendation_id}` | **None** :material-alert: |  | `routers/recommendation.py:38` `get_recommendation` |
| `PATCH` | `/recommendations/{recommendation_id}` | **None** :material-alert: |  | `routers/recommendation.py:43` `update_recommendation` |

## Reports

| Method | Path | Auth | Rate limited | Handler |
| --- | --- | --- | --- | --- |
| `GET` | `/reports` | **None** :material-alert: |  | `routers/report.py:19` `list_reports` |
| `POST` | `/reports` | **None** :material-alert: |  | `routers/report.py:14` `create_report` |
| `GET` | `/reports/case/{case_id}` | **None** :material-alert: |  | `routers/report.py:29` `get_report_for_case` |
| `PUT` | `/reports/case/{case_id}` | **None** :material-alert: |  | `routers/report.py:34` `generate_report_for_case` |
| `DELETE` | `/reports/{report_id}` | **None** :material-alert: |  | `routers/report.py:47` `delete_report` |
| `GET` | `/reports/{report_id}` | **None** :material-alert: |  | `routers/report.py:42` `get_report` |

## Schools

| Method | Path | Auth | Rate limited | Handler |
| --- | --- | --- | --- | --- |
| `GET` | `/schools` | Signed in |  | `routers/school.py:25` `list_schools` |
| `POST` | `/schools` | System admin |  | `routers/school.py:16` `create_school` |
| `DELETE` | `/schools/{school_id}` | System admin |  | `routers/school.py:55` `delete_school` |
| `GET` | `/schools/{school_id}` | Signed in |  | `routers/school.py:36` `get_school` |
| `PATCH` | `/schools/{school_id}` | System or school admin |  | `routers/school.py:45` `update_school` |

## Screening assessments

| Method | Path | Auth | Rate limited | Handler |
| --- | --- | --- | --- | --- |
| `GET` | `/screening-assessments` | **None** :material-alert: |  | `routers/screening_assessment.py:25` `list_assessments` |
| `POST` | `/screening-assessments` | **None** :material-alert: |  | `routers/screening_assessment.py:20` `create_assessment` |
| `DELETE` | `/screening-assessments/{assessment_id}` | **None** :material-alert: |  | `routers/screening_assessment.py:60` `delete_assessment` |
| `GET` | `/screening-assessments/{assessment_id}` | **None** :material-alert: |  | `routers/screening_assessment.py:40` `get_assessment` |
| `POST` | `/screening-assessments/{assessment_id}/complete` | **None** :material-alert: |  | `routers/screening_assessment.py:55` `complete_assessment` |
| `GET` | `/screening-assessments/{assessment_id}/plan` | **None** :material-alert: |  | `routers/screening_assessment.py:50` `get_plan` |
| `GET` | `/screening-assessments/{assessment_id}/progress` | **None** :material-alert: |  | `routers/screening_assessment.py:45` `get_progress` |

## Screening interpretations

| Method | Path | Auth | Rate limited | Handler |
| --- | --- | --- | --- | --- |
| `GET` | `/screening-interpretations` | **None** :material-alert: |  | `routers/screening_interpretation.py:46` `list_interpretations` |
| `POST` | `/screening-interpretations` | System admin |  | `routers/screening_interpretation.py:25` `create_interpretation` |
| `POST` | `/screening-interpretations/bulk` | System admin |  | `routers/screening_interpretation.py:34` `seed_interpretations` |
| `DELETE` | `/screening-interpretations/{interpretation_id}` | System admin |  | `routers/screening_interpretation.py:72` `delete_interpretation` |
| `GET` | `/screening-interpretations/{interpretation_id}` | **None** :material-alert: |  | `routers/screening_interpretation.py:57` `get_interpretation` |
| `PATCH` | `/screening-interpretations/{interpretation_id}` | System admin |  | `routers/screening_interpretation.py:62` `update_interpretation` |

## Screening questions

| Method | Path | Auth | Rate limited | Handler |
| --- | --- | --- | --- | --- |
| `GET` | `/screening-questions` | **None** :material-alert: |  | `routers/screening_question.py:41` `list_questions` |
| `POST` | `/screening-questions` | System admin |  | `routers/screening_question.py:21` `create_question` |
| `POST` | `/screening-questions/bulk` | System admin |  | `routers/screening_question.py:30` `seed_questions` |
| `DELETE` | `/screening-questions/{question_id}` | System admin |  | `routers/screening_question.py:70` `delete_question` |
| `GET` | `/screening-questions/{question_id}` | **None** :material-alert: |  | `routers/screening_question.py:55` `get_question` |
| `PATCH` | `/screening-questions/{question_id}` | System admin |  | `routers/screening_question.py:60` `update_question` |

## Screening responses

| Method | Path | Auth | Rate limited | Handler |
| --- | --- | --- | --- | --- |
| `GET` | `/screening-responses` | **None** :material-alert: |  | `routers/screening_response.py:31` `list_responses` |
| `POST` | `/screening-responses` | **None** :material-alert: |  | `routers/screening_response.py:20` `create_response` |
| `PUT` | `/screening-responses/bulk` | **None** :material-alert: |  | `routers/screening_response.py:25` `save_answers` |
| `DELETE` | `/screening-responses/{response_id}` | **None** :material-alert: |  | `routers/screening_response.py:54` `delete_response` |
| `GET` | `/screening-responses/{response_id}` | **None** :material-alert: |  | `routers/screening_response.py:42` `get_response` |
| `PATCH` | `/screening-responses/{response_id}` | **None** :material-alert: |  | `routers/screening_response.py:47` `update_response` |

## Students

| Method | Path | Auth | Rate limited | Handler |
| --- | --- | --- | --- | --- |
| `GET` | `/students` | School admin, teacher or parent |  | `routers/student.py:94` `list_students` |
| `POST` | `/students` | Teacher |  | `routers/student.py:84` `create_student` |
| `POST` | `/students/parent-invitation` | Public (token or step token in body) | Yes | `routers/student.py:51` `parent_invitation` |
| `POST` | `/students/parent-invitation/accept` | Public (token or step token in body) | Yes | `routers/student.py:77` `accept_parent_invitation` |
| `POST` | `/students/parent-invitation/verify-email` | Public (token or step token in body) | Yes | `routers/student.py:64` `verify_parent_email` |
| `DELETE` | `/students/{student_id}` | School admin, teacher or parent |  | `routers/student.py:127` `delete_student` |
| `GET` | `/students/{student_id}` | School admin, teacher or parent |  | `routers/student.py:108` `get_student` |
| `PATCH` | `/students/{student_id}` | School admin, teacher or parent |  | `routers/student.py:117` `update_student` |
| `PATCH` | `/students/{student_id}/activate` | School admin, teacher or parent |  | `routers/student.py:137` `activate_student` |
| `PATCH` | `/students/{student_id}/deactivate` | School admin, teacher or parent |  | `routers/student.py:146` `deactivate_student` |
| `GET` | `/students/{student_id}/parent-invitation` | School admin, teacher or parent |  | `routers/student.py:159` `parent_invitation_status` |
| `POST` | `/students/{student_id}/resend-parent-invitation` | School admin, teacher or parent | Yes | `routers/student.py:173` `resend_parent_invitation` |

## Users

| Method | Path | Auth | Rate limited | Handler |
| --- | --- | --- | --- | --- |
| `GET` | `/users` | Signed in |  | `routers/user.py:26` `list_users` |
| `POST` | `/users` | System admin, school admin or teacher |  | `routers/user.py:16` `create_user` |
| `DELETE` | `/users/{user_id}` | Signed in |  | `routers/user.py:55` `delete_user` |
| `GET` | `/users/{user_id}` | Signed in |  | `routers/user.py:36` `get_user` |
| `PATCH` | `/users/{user_id}` | Signed in |  | `routers/user.py:45` `update_user` |
| `POST` | `/users/{user_id}/activate` | Signed in |  | `routers/user.py:65` `activate_user` |
| `POST` | `/users/{user_id}/deactivate` | Signed in |  | `routers/user.py:74` `deactivate_user` |
| `POST` | `/users/{user_id}/resend-invitation` | Signed in |  | `routers/user.py:83` `resend_invitation` |

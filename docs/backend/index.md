---
title: Backend Overview
description: The Mirai API's stack, module layout, authentication, configuration, background jobs and conventions.
---

# Backend

<p class="mi-lead">The Mirai API is a Python FastAPI service backed by PostgreSQL. It is the only component that touches the database, and it owns every business rule.</p>

## Stack

| Concern | Choice |
| --- | --- |
| Language | Python 3.11 or later (`pyproject.toml`) |
| Framework | FastAPI (ASGI), served by Uvicorn |
| Validation | Pydantic models on every request and response |
| ORM and migrations | SQLAlchemy ORM (parameterised queries only), Alembic migrations |
| Database | PostgreSQL |
| Auth | Argon2 password hashing (`argon2-cffi`), RS256 JWTs (`pyjwt`), refresh token sent in the request body, TOTP with `pyotp` |
| AI client | Google Gemini API with File Search (isolated module) |
| Email | SMTP, or printed to the log in development (`core/mailer.py`, `EMAIL_BACKEND`) |
| Testing | pytest with pytest-cov on in-memory SQLite (`tests/`) |
| CI | GitHub Actions: `pr-checks.yml`, `ci.yml` (pytest + coverage), `deploy.yml` (Heroku), as described in the backend README. *Planned:* Bandit, Safety and pip-audit |

## Module layout

The backend is organised so that the scoring engine cannot depend on anything generative, and every route goes through the same auth, scoping and audit helpers.

# mirAI Backend: Module Layout

This is a flat FastAPI project: there is no `app/` package, and every layer (`routers/`, `services/`, `repositories/`, `models/`, `schemas/`) sits at the top level.

## Folder and file layout

```text
backend/
├── main.py                     # FastAPI app, lifespan (seeds system admin, purges expired tokens),
│                               # CORS, security-headers middleware, router registration, /health
├── database.py                 # engine factory (Postgres / SQLite for tests), SessionLocal,
│                               # get_db(), Base, UTCDateTime, JSONType, check_in() helper
├── dependencies.py             # bearer auth: get_current_user, require_roles(...) and role aliases
├── mail_tap.py                 # dev-only: serves invite tokens / OTPs from the console-mail log
├── test_gemini.py              # one-off Gemini connectivity check
├── Procfile                    # web: uvicorn main:app · release: alembic upgrade head
├── pyproject.toml / uv.lock    # dependencies (uv), ruff, pytest, coverage config
├── alembic.ini
├── alembic/                    # migrations
│   ├── env.py
│   └── versions/
│       └── sync_enum_values.py
├── core/
│   ├── config.py               # pydantic-settings Settings from env / .env (get_settings, cached)
│   ├── security.py             # Argon2 hashing, RS256 JWT (scoped tokens), TOTP, Fernet field
│   │                           # encryption, hashed one-time link tokens
│   ├── mailer.py               # EmailService + Console / Memory / SMTP backends, HTML templates
│   └── rate_limit.py           # slowapi Limiter
├── ai/
│   ├── context.py              # builds the learner context (answers, bands, scores) for prompts
│   ├── guard.py                # scrub(): swaps personal names for "the learner"
│   └── schemas.py              # structured-output models (EvalQuestionsOutput)
├── models/                     # SQLAlchemy tables
│   ├── enums.py                # Role, CaseStatus, ToolType, Level, IEPStatus, AuditAction, ...
│   ├── school.py · user.py · student.py · proffessional.py
│   ├── case.py                 # one open case per student (partial unique index)
│   ├── screening_question.py · screening_assessment.py
│   ├── screening_response.py · screening_interpretation.py
│   ├── iep.py · iep_evaluation_question.py · iep_evaluation_response.py
│   ├── recommendation.py · report.py · notification.py
│   ├── ai.py                   # AIJob (queued / running / succeeded / failed)
│   ├── audit_log.py            # append-only (update/delete blocked by ORM events)
│   ├── link_token.py           # hashed invite / reset tokens
│   └── revoked_token.py        # JWT denylist (jti)
├── schemas/                    # Pydantic request / response models, one file per resource
│                               # (auth, user, school, student, case, screening_*, domain_score,
│                               #  iep, iep_evaluation_*, recommendation, report, notification,
│                               #  professional, audit_log, ai)
├── repositories/               # data access only (queries, protected fields, integrity errors),
│                               # one file per resource, plus domain_score.py and ai.py
├── routers/                    # thin HTTP layer, 123 endpoints:
│                               # /auth  /users  /schools  /students  /cases  /screening-questions
│                               # /screening-assessments  /screening-responses
│                               # /screening-interpretations  /domain-scores  /reports  /ieps
│                               # /iep-evaluation-questions  /iep-evaluation-responses
│                               # /recommendations  /professionals  /notifications
│                               # /audit-logs  /ai
├── services/                   # business logic and permission checks
│   ├── auth.py                 # login, lockout, MFA enrol/verify, refresh, logout, revocation
│   ├── onboarding.py           # staff invitations, forgot / reset password
│   ├── user.py · school.py · professional.py · notification.py
│   ├── student.py              # students + ParentInvitationService (invite, accept, resend limits)
│   ├── case.py                 # case lifecycle and role / ownership checks
│   ├── screening_question.py · screening_assessment.py
│   ├── screening_response.py · screening_interpretation.py
│   ├── screening_rules.py      # pure scoring rules: age gates, anchors, density, bands
│   ├── domain_score.py         # combines teacher + parent scores, then generates the report
│   ├── report.py · report_builder.py   # deterministic parent-facing report content
│   ├── iep.py · iep_evaluation_question.py · iep_evaluation_response.py
│   ├── recommendation.py
│   ├── ai.py                   # Gemini + File Search provider, name guard, AI job runner
│   ├── audit_log.py            # read / list audit entries (school-scoped)
│   └── audit.py                # lightweight structured audit logger
├── static/
│   └── email/mirai-logo.png
└── tests/                      # pytest on SQLite, one file per feature
    ├── conftest.py · screening_helpers.py · workflow_helpers.py
    └── test_*.py               # auth, security, case, screening_*, domain_score, iep*,
                                # parent_invitation/access, ai, migrations, mailer, ...
```

## Key code snippets

### 1. App wiring: lifespan and security headers (`main.py`)

```python
@asynccontextmanager
async def lifespan(app: FastAPI):
    if settings.auto_create_tables:
        Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        user_service.seed_system_admin(db)
        auth_service.purge_expired_tokens(db)
    except Exception:
        db.rollback()
        logger.exception("start-up tasks failed")
        raise
    finally:
        db.close()
    yield


app = FastAPI(title="mirAI API", version="1.0.0", lifespan=lifespan)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)


@app.middleware("http")
async def security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "no-referrer"
    response.headers["Cache-Control"] = "no-store"
    if settings.is_production:
        response.headers["Content-Security-Policy"] = "default-src 'none'; frame-ancestors 'none'"
        response.headers["Strict-Transport-Security"] = "max-age=63072000; includeSubDomains"
    return response
```

### 2. Auth and role guards (`dependencies.py`)

```python
bearer = HTTPBearer(scheme_name="MirAIBearer", auto_error=False)


def get_current_session(
    db: Session = Depends(get_db),
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer),
) -> tuple[User, dict]:
    if credentials is None or not credentials.credentials:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Not authenticated.",
                            headers={"WWW-Authenticate": "Bearer"})
    return auth_service.authenticate_access_token(db, credentials.credentials)


def require_roles(*roles: RoleEnum):
    allowed = set(roles)

    def checker(user: User = Depends(get_current_user)) -> User:
        if RoleEnum(user.role) not in allowed:
            raise HTTPException(status.HTTP_403_FORBIDDEN,
                                "You do not have access to this resource.")
        return user

    return checker


require_admin = require_roles(RoleEnum.SYSTEM_ADMIN, RoleEnum.SCHOOL_ADMIN)
require_staff = require_roles(RoleEnum.SCHOOL_ADMIN, RoleEnum.TEACHER)
```

### 3. Scoped RS256 tokens and TOTP (`core/security.py`)

```python
SCOPE_ACCESS, SCOPE_REFRESH = "access", "refresh"
SCOPE_MFA_ENROLL, SCOPE_MFA_VERIFY = "mfa_enroll", "mfa_verify"


def create_token(subject: str, scope: str, expires: timedelta, extra: dict | None = None):
    now = datetime.now(timezone.utc)
    jti, exp = uuid.uuid4().hex, now + expires
    claims = {"sub": str(subject), "scope": scope, "jti": jti, "iat": now, "exp": exp,
              "iss": settings.jwt_issuer, "aud": settings.jwt_audience, **(extra or {})}
    return jwt.encode(claims, PRIVATE_KEY, algorithm="RS256"), jti, exp


def decode_token(token: str, expected_scope: str) -> dict:
    try:
        payload = jwt.decode(token, PUBLIC_KEY, algorithms=["RS256"],
                             audience=settings.jwt_audience, issuer=settings.jwt_issuer,
                             options={"require": ["exp", "sub", "jti", "scope"]})
    except jwt.PyJWTError as exc:
        raise TokenError(str(exc)) from exc
    if payload["scope"] != expected_scope:
        raise TokenError("wrong token scope")
    return payload


def verify_totp(secret: str, code: str, last_used_step: int = 0) -> int | None:
    if not code or not re.fullmatch(r"\d{6}", code):
        return None
    totp = pyotp.TOTP(secret)
    current = int(time.time() // totp.interval)
    for step in (current - 1, current, current + 1):          # ±1 step drift, no replay
        if step > last_used_step and hmac.compare_digest(totp.generate_otp(step), code):
            return step
    return None
```

### 4. Pure screening rules (`services/screening_rules.py`)

```python
SCALE_TOP = 3.0
ANCHOR_OPEN_AT = 2
DYSLEXIA_FROM_AGE = 6
SNAP_IV_FROM_AGE = 5


def item_score(item: Item, value: int) -> int:
    if value < 0 or value > item.answer_scale - 1:
        raise ValueError("answer outside the question's scale")
    return item.answer_scale - 1 - value if item.reverse_scored else value


def density(raw: int, minimum: int, maximum: int) -> float:
    if maximum <= minimum:
        return 0.0
    value = Decimal(raw - minimum) / Decimal(maximum - minimum) * Decimal(str(SCALE_TOP))
    return float(value.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP))


def combine(teacher: float, parent: float) -> float:
    value = (Decimal(str(teacher)) + Decimal(str(parent))) / 2
    return float(value.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP))


def tool_for_domain(domain, age):
    if domain == TargetNeurodivergenceEnum.ADHD:
        return ToolTypeEnum.ADHD_RS_PRESCHOOL if age is not None and age < SNAP_IV_FROM_AGE \
            else ToolTypeEnum.SNAP_IV
    return ANCHOR_TOOL[domain]


def open_tools(anchor_values, age=None) -> list[ToolTypeEnum]:
    opened = {tool_for_domain(d, age) for d, v in anchor_values.items()
              if v >= ANCHOR_OPEN_AT and anchor_applies(d, age)}
    return [t for t in SECTION_TOOLS if t in opened]
```

### 5. Case model: one open case per student (`models/case.py`)

```python
class Case(Base):
    __tablename__ = "case"
    __table_args__ = (
        CheckConstraint("autism_score BETWEEN 0 AND 3", name="ck_case_autism_score"),
        CheckConstraint("domain_density_score BETWEEN 0 AND 3", name="ck_case_density_score"),
        Index("uq_case_one_open_per_student", "student_id", unique=True,
              postgresql_where=text(
                  "status NOT IN ('COMPLETED', 'NO_CONCERN_IDENTIFIED', 'CLOSED')")),
    )

    case_id = Column(UUID(as_uuid=True), primary_key=True,
                     server_default=text("gen_random_uuid()"))
    status = Column(Enum(CaseStatusEnum, name="casestatusenum"),
                    default=CaseStatusEnum.INITIATED, nullable=False)
    # INITIATED → TEACHER_SCREENING_COMPLETED → PARENT_SCREENING_COMPLETED
    # → IEP_PENDING_APPROVAL → IEP_ACTIVE → EVALUATION_PENDING → COMPLETED
```

### 6. Append-only audit log (`models/audit_log.py`)

```python
@event.listens_for(AuditLog, "before_update")
def _block_update(mapper, connection, target):
    raise ValueError("Audit log rows cannot be changed")


@event.listens_for(AuditLog, "before_delete")
def _block_delete(mapper, connection, target):
    raise ValueError("Audit log rows cannot be deleted")
```

### 7. Layering: router → service → repository (`routers/case.py`, `services/case.py`)

```python
# routers/case.py — HTTP only
router = APIRouter(prefix="/cases", tags=["Cases"])

@router.post("", response_model=CaseRead, status_code=status.HTTP_201_CREATED)
def create_case(payload: CaseCreate, db: Session = Depends(get_db),
                user: User = Depends(get_current_user)):
    return case_service.create_case(db, payload, user)


# services/case.py — permissions and rules
def get_case(self, db, case_id, actor) -> CaseRead:
    if self._is_parent(actor):
        case = case_repository.get(db, case_id)        # parents: own child only
        if not case or not self._parent_owns(db, actor, case.student_id):
            raise HTTPException(status.HTTP_403_FORBIDDEN, FORBIDDEN)
        return CaseRead.model_validate(case)
    self._require_role(actor, *TEACHER_OR_ADMIN)
    return CaseRead.model_validate(self._get_or_404(db, case_id))
```

### 8. AI: Gemini File Search, name guard and background jobs (`services/ai.py`, `routers/ai.py`)

```python
def _run(self, prompt: str, metadata_filter: str, schema):
    resp = self.client.models.generate_content(
        model=GEMINI_MODEL,
        contents=prompt,
        config=types.GenerateContentConfig(
            system_instruction=SYSTEM_PROMPT,          # no names, no diagnoses, cite docs
            temperature=0.3,
            response_mime_type="application/json",
            response_schema=schema,
            tools=[types.Tool(file_search=types.FileSearch(
                file_search_store_names=[FILE_SEARCH_STORE_NAME],
                metadata_filter=metadata_filter))],
        ),
    )
    return schema.model_validate_json(resp.text), _references(resp)


def assert_no_names(text: str, names: list[str]) -> None:
    low = text.lower()
    for full in names:
        for token in {full, *full.split()}:
            if len(token) >= 3 and re.search(rf"\b{re.escape(token.lower())}\b", low):
                raise AIOutputRejected("The generated text contained a personal name.")


# routers/ai.py — returns 202 with a job; the work runs after the response
@router.post("/cases/{case_id}/iep", response_model=AIJobRead, status_code=202)
def start_iep_generation(case_id: uuid.UUID, background: BackgroundTasks,
                         db: Session = Depends(get_db), actor: User = Depends(get_current_user)):
    job = ai_service.start_iep(db, actor, case_id)
    background.add_task(run_job, job.job_id)
    return job
```

### 9. Deterministic report builder (`services/report_builder.py`)

```python
def build_report_content(result: CaseScoreRead) -> dict:
    return {
        "disclaimer": DISCLAIMER,
        "summary": {
            "overall_score": result.domain_density_score,
            "scale_max": rules.SCALE_TOP,
            "primary_domain": result.primary_domain.value if result.primary_domain else None,
            "support_plan_recommended": result.iep_recommended,
            "next_step": NEXT_STEP_SUPPORT if result.iep_recommended else NEXT_STEP_NONE,
        },
        "domains": [{"domain": s.domain.value, "tool": s.tool_type.value,
                     "score": s.combined_score, "level": s.level.value if s.level else None,
                     "band_label": s.band_label, "meaning": s.meaning_text}
                    for s in result.scores],
        "not_screened": [{"domain": n.domain.value, "status": "Not screened further"}
                         for n in result.not_screened],
    }
```


## Functional modules

Each module in the [functional architecture](../architecture/index.md#functional-architecture) maps to a router and a service.

| Module | Responsibility | Main tables |
| --- | --- | --- |
| School management | Create schools, school admins, teachers; revoke staff; school profile | `school`, `user` |
| Assessment | Open cases, serve questions, accept answers | `case`, `screening_assessment`, `screening_question`, `screening_response` |
| Scoring | Domain scores and bands, stored on the case | `case` (`autism_score`, `adhd_score`, `dyslexia_score`, `domain_density_score`, `primary_domain`), `screening_interpretation` |
| Report generation | Build and rebuild the per-case report | `report` |
| Parent recommendations | Home activities and professional directory | `recommendation`, `professional` |
| IEP | Draft (AI or manual), edit, submit, regenerate | `iep`, `ai_job` |
| IEP approval | Teacher and school admin approval or rejection | `iep`, `case` |
| Evaluation | Generate questions, unlock after six weeks, collect answers | `iep_evaluation_question`, `evaluation_response` |
| Audit | Write and read audit events | `audit_log` |

## Authentication and sessions

| Rule | Value |
| --- | --- |
| Account creation | Top-down only: system admin creates school admins, school admins create teachers, teachers create parents. No public sign-up. |
| First sign-in | Forces a password change and authenticator-app (TOTP) enrolment for every role |
| Second factor | 6-digit TOTP; each time-step accepted once (`last_totp_step`) |
| Lockout | 5 failed attempts lock the account for 15 minutes |
| Access token | RS256 JWT, 15 minutes, with `sub`, `scope`, `jti`, `role`, `tv` (token version), issuer and audience (`core/security.py`) |
| Refresh token | RS256 JWT, 7 days, sent in the body of `POST /auth/refresh`; the web apps keep it in browser storage. *Planned:* `HttpOnly` cookie |
| Idle and absolute timeouts | *Planned:* 15 minutes idle and 8 hours absolute for staff, 30 minutes idle for parents |
| Sign-out and revocation | `jti` added to `revoked_token`; raising `token_version` ends every older session |

## Authorisation pattern

A route gets the caller from a dependency, and the service checks the role and the caller's relationship to the record. This is the real pattern from `routers/case.py` and `services/case.py`:

```python
@router.get("/{case_id}", response_model=CaseRead)
def get_case(
    case_id: uuid.UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),      # 401 without a valid token
):
    return case_service.get_case(db, case_id, user)

# services/case.py
def get_case(self, db, case_id, actor):
    if self._is_parent(actor):                   # a parent sees only their own child's case
        case = case_repository.get(db, case_id)
        if not case or not self._parent_owns(db, actor, case.student_id):
            raise HTTPException(status.HTTP_403_FORBIDDEN, FORBIDDEN)
        return CaseRead.model_validate(case)
    self._require_role(actor, *TEACHER_OR_ADMIN)
    return CaseRead.model_validate(self._get_or_404(db, case_id))
```

!!! danger "Not every route follows this yet"

    45 routes have no caller dependency at all. The [Endpoint List](api-endpoints.md) marks them, and [Implementation Status](../reference/implementation-status.md#security-gaps) lists the fixes.

Rules for new and fixed handlers:

- **Return 404, not 403, for records outside the caller's scope**, so IDs cannot be probed. (Today `services/case.py` returns 403 to a parent asking for another family's case.)
- **Never trust IDs from the client** for ownership: resolve the student, then check `teacher_id` or `parent_id` against the caller.
- **Use role-specific response models**, so a school admin projection physically has no field for raw answers.
- **Record sensitive actions.** `services/audit.py` writes authentication events to the server log; rows in the `audit_log` table are written through `repositories/audit_log.py` (today only for parent consent and invitation resends).

## Configuration

Settings are environment variables read by `core/config.py` (pydantic-settings, also from a local `.env`). The full list for production is on [Deployment](../platform/deployment.md#api-settings-for-production). Nothing secret is committed.

| Variable | Purpose | Default |
| --- | --- | --- |
| `ENVIRONMENT` | `development` or `production`; production enforces the required settings | `development` |
| `DATABASE_URL` | Database connection (PostgreSQL in production) | `sqlite:///./local.db` |
| `JWT_PRIVATE_KEY`, `JWT_PUBLIC_KEY` | RS256 key pair | generated per start in development |
| `ACCESS_TOKEN_EXPIRE_MINUTES`, `REFRESH_TOKEN_EXPIRE_DAYS`, `STEP_TOKEN_EXPIRE_MINUTES` | Token lifetimes | 15, 7, 10 |
| `MFA_ENCRYPTION_KEY` | Fernet key for TOTP secrets | derived from the JWT key in development |
| `MAX_FAILED_LOGINS`, `LOCKOUT_MINUTES` | Lockout | 5, 15 |
| `RATE_LIMIT_ENABLED`, `LOGIN_RATE_LIMIT`, `MFA_RATE_LIMIT`, `REFRESH_RATE_LIMIT`, `RESET_RATE_LIMIT` | Rate limits | on; 10, 10, 30, 5 per minute |
| `CORS_ORIGINS` | Allowed web app origins, comma-separated | `http://localhost:3000` |
| `FRONTEND_BASE_URL` | Link base for invitation and reset emails | `http://localhost:3000` |
| `EMAIL_BACKEND`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_USERNAME`, `SMTP_PASSWORD`, `MAIL_FROM` | Email (`console`, `memory` or `smtp`) | `console` |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | Seed for the first system administrator | none |
| `AUTO_CREATE_TABLES` | Create tables at start-up instead of migrations | `false` |
| `GEMINI_API_KEY`, `GEMINI_MODEL`, `FILE_SEARCH_STORE_NAME` | Gemini access, model id and File Search store (`services/ai.py`); the production model is open ([Q-08](../reference/decision-log.md#open-questions)) | placeholders that stop AI jobs |

## Background work

| Work | When | Where |
| --- | --- | --- |
| Seed the system administrator | At start-up | `main.py` (`lifespan`), `services/user.py` |
| Delete expired revoked tokens | At start-up | `main.py`, `services/auth.py` (`purge_expired_tokens`) |
| AI generation jobs | After the request returns (FastAPI `BackgroundTasks`) | `routers/ai.py`, `services/ai.py` (`run_job`) |

*Planned:* scheduled jobs that close intake windows, notify teacher and parent when an evaluation unlocks, and apply the [retention schedule](../security/privacy-compliance.md#data-retention). The evaluation unlock date itself is set when an IEP is approved (`services/iep.py`).

## Errors

Errors use FastAPI's default body. Unhandled exceptions are logged server-side and return a generic `500`.

| Status | When |
| --- | --- |
| `400` | Business rule violation |
| `401` | Not signed in, token expired or revoked |
| `403` | Signed in but not allowed this action |
| `404` | Not found |
| `409` | Conflict (for example the student already has an open case) |
| `422` | Invalid input (Pydantic validation; `detail` is a list of field errors) |
| `429` | Too many requests |

```json
{ "detail": "This student already has an open case. Finish or close it before starting another." }
```

## In this section

- [Screening and Scoring Engine](scoring-engine.md): age gating, intake state machine, formulas and discrepancy
- [API Reference](api.md): endpoint groups, roles and contracts

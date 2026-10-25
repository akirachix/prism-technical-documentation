# Mirai Technical Documentation

Technical documentation for **Mirai**, the non-diagnostic pre-referral observation
platform built by **Team Prism** for early childhood teachers and parents in
Nairobi's mid-tier and low-cost private schools.

Built with [MkDocs](https://www.mkdocs.org/) and
[Material for MkDocs](https://squidfunk.github.io/mkdocs-material/).

Published site: <https://akirachix.github.io/prism-technical-documentation/>

## What is inside

| Directory | Purpose |
| --- | --- |
| `docs/index.md` | Home page |
| `docs/start-here/` | Overview, problem and impact, users and personas, documentation guide |
| `docs/architecture/` | System architecture, system context, case lifecycle, data model, user flows |
| `docs/backend/` | FastAPI service, screening and scoring engine, API reference |
| `docs/ai/` | RAG architecture, IEP and evaluation generation, guardrails |
| `docs/frontend/` | PWA, screens, Mirai style guide |
| `docs/platform/` | Environments, CI/CD, secrets, backups, monitoring, cost |
| `docs/security/` | Security controls, access control, privacy and compliance, threat model |
| `docs/developer-guide/` | Workflow, local setup, testing and QA |
| `docs/reference/` | Glossary, decision log, team, source documents |
| `docs/assets/` | Diagrams, screens, brand files |
| `docs/stylesheets/extra.css` | Mirai theme for Material |
| `docs/javascripts/zoom.js` | Click-to-zoom for diagrams and screenshots |

## Prerequisites

- Python 3.10 or later
- pip

## Local development

Create and activate a virtual environment:

    python3 -m venv .venv
    source .venv/bin/activate

Install dependencies:

    python -m pip install -r requirements.txt

Run the local preview:

    mkdocs serve

Then open <http://127.0.0.1:8000>.

Build the documentation:

    mkdocs build --strict

The generated site is written to `site/`, which is excluded from version control.

## Continuous integration and publishing

`.github/workflows/docs.yml` runs `mkdocs build --strict` on pushes to `main` and
`feature/**` and on pull requests. On `main`, it also publishes the site to GitHub Pages.

One-time setup: in the repository **Settings → Pages**, set **Source** to **GitHub Actions**.

## Contribution workflow

1. Create a feature branch, for example `docs/scoring-examples`.
2. Make a focused documentation change.
3. Run `mkdocs build --strict`.
4. Review changes with `git diff --check`.
5. Commit and push the feature branch.
6. Open a pull request for review.

See the full guide in `docs/start-here/documentation-guide.md`.

## Quality expectations

- Keep navigation entries in `mkdocs.yml` aligned with the pages in `docs/`.
- Verify technical claims against the source documents or the code; record conflicts in the decision log.
- Use non-diagnostic language about children.
- Never include credentials, access tokens, real student data or other secrets.
- Keep changes focused and reviewable.
- Ensure the strict documentation build passes before opening a pull request.

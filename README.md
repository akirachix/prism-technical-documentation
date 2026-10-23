# Prism Technical Documentation

Technical documentation for Prism, the Mirai product, built with
[MkDocs](https://www.mkdocs.org/) and
[Material for MkDocs](https://squidfunk.github.io/mkdocs-material/).

## Status

This repository contains the initial documentation scaffold. Detailed
technical content will be added and verified against the relevant source
repositories and project references.

## Documentation structure

| Directory | Purpose |
| --- | --- |
| `docs/start-here/` | Documentation orientation and contribution guidance |
| `docs/architecture/` | System architecture and context |
| `docs/backend/` | Backend components and APIs |
| `docs/ai/` | AI-related components and workflows |
| `docs/frontend/` | Frontend applications and architecture |
| `docs/platform/` | Infrastructure and deployment |
| `docs/security/` | Security architecture and controls |
| `docs/developer-guide/` | Development setup and workflows |
| `docs/reference/` | Supporting technical references |

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

Build the documentation:

    mkdocs build --strict

The generated site is written to `site/`, which is excluded from version control.

## Contribution workflow

1. Create a feature branch.
2. Make a focused documentation change.
3. Run `mkdocs build --strict`.
4. Review changes with `git diff --check`.
5. Commit and push the feature branch.
6. Open a pull request for review.

## Quality expectations

- Keep navigation entries aligned with existing documentation pages.
- Verify technical claims against authoritative project sources.
- Never include credentials, access tokens, or other secrets.
- Keep changes focused and reviewable.
- Ensure the strict documentation build passes before opening a pull request.

---
title: Source Code
description: The repositories this documentation describes, the commit each page was checked against, and how reviewers can open them.
---

# Source Code

<p class="mi-lead">This documentation describes three code repositories. Claims in these pages are checked against the commits below; the <a href="../traceability/">Traceability</a> page maps each important claim to a file.</p>

| Repository | What it contains | Checked at commit |
| --- | --- | --- |
| [prism-backend](https://github.com/akirachix/prism-backend) | FastAPI service, scoring rules, AI jobs, migrations, pytest suite | `<commit SHA>` |
| [prism-frontend](https://github.com/akirachix/prism-frontend) | Teacher and parent PWA (Next.js) and its Jest tests | `<commit SHA>` |
| `prism-dashboard` | School administrator and system administrator dashboard (Next.js) and its Jest tests | `<commit SHA>` |

## Reviewing the code next to the docs

The repositories are included in this documentation repository as git submodules under `evidence/`. They are not part of the published site.

```bash
git clone --recurse-submodules https://github.com/akirachix/prism-technical-documentation
# or, in an existing clone:
git submodule update --init
```

## Keeping the commits current

When a code change affects a documented behaviour:

1. Update the page in the same pull request.
2. Move the submodule to the new commit: `git -C evidence/prism-backend pull && git add evidence/prism-backend`.
3. Re-run `python scripts/generate_api_reference.py evidence/prism-backend` if routes changed.
4. Update the commit in the table above.

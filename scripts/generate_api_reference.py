import ast
import pathlib
import subprocess
import sys

AUTH = {
    "get_current_user": "Signed in",
    "get_current_session": "Signed in",
    "require_system_admin": "System admin",
    "require_school_admin": "School admin",
    "require_teacher": "Teacher",
    "require_parent": "Parent",
    "require_admin": "System or school admin",
    "require_staff": "School admin or teacher",
    "require_school_member": "School admin, teacher or parent",
    "require_teacher_or_parent": "Teacher or parent",
    "require_onboarders": "System admin, school admin or teacher",
}
PUBLIC_BY_DESIGN = {
    "/auth/login", "/auth/refresh", "/auth/change-password", "/auth/mfa/enroll",
    "/auth/mfa/enroll/confirm", "/auth/mfa/verify", "/auth/accept-invitation",
    "/auth/forgot-password", "/auth/reset-password", "/students/parent-invitation",
    "/students/parent-invitation/verify-email", "/students/parent-invitation/accept",
}


def routes(backend: pathlib.Path):
    for f in sorted((backend / "routers").glob("*.py")):
        if f.name == "__init__.py":
            continue
        tree = ast.parse(f.read_text())
        prefix, tag = "", f.stem
        for n in ast.walk(tree):
            if isinstance(n, ast.Call) and getattr(n.func, "id", "") == "APIRouter":
                for k in n.keywords:
                    if k.arg == "prefix":
                        prefix = k.value.value
                    if k.arg == "tags":
                        tag = k.value.elts[0].value
        for fn in tree.body:
            if not isinstance(fn, (ast.FunctionDef, ast.AsyncFunctionDef)):
                continue
            for d in fn.decorator_list:
                if not (isinstance(d, ast.Call) and isinstance(d.func, ast.Attribute)
                        and getattr(d.func.value, "id", "") == "router"):
                    continue
                path = prefix + (d.args[0].value if d.args else "")
                args = ast.unparse(fn.args)
                auth = [AUTH[k] for k in AUTH if k in args]
                limited = any("limiter.limit" in ast.unparse(x) for x in fn.decorator_list)
                if auth:
                    who = auth[0]
                elif path in PUBLIC_BY_DESIGN:
                    who = "Public (token or step token in body)" if path != "/auth/login" else "Public"
                else:
                    who = "**None** :material-alert:"
                yield tag, d.func.attr.upper(), path, who, limited, f"routers/{f.name}", fn.lineno, fn.name


def main():
    backend = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else "evidence/prism-backend")
    out = pathlib.Path(sys.argv[2] if len(sys.argv) > 2 else "docs/backend/api-endpoints.md")
    try:
        sha = subprocess.run(["git", "-C", str(backend), "rev-parse", "--short", "HEAD"],
                             capture_output=True, text=True, check=True).stdout.strip()
    except Exception:
        sha = "unknown (not a git checkout)"
    rows = list(routes(backend))
    unauth = [r for r in rows if r[3].startswith("**None")]
    lines = [
        "---",
        "title: Endpoint List",
        "description: Every route in the Mirai API, generated from the backend routers.",
        "---",
        "",
        "# Endpoint List",
        "",
        f'<p class="mi-lead">Generated from <code>prism-backend</code> at commit <code>{sha}</code> by '
        "<code>scripts/generate_api_reference.py</code>. Do not edit by hand; re-run the script after backend changes.</p>",
        "",
        f"**{len(rows)} routes.** The *Auth* column shows the dependency on the route itself. "
        "Role checks inside services are listed in [Access Control](../security/access-control.md).",
        "",
    ]
    if unauth:
        lines += [
            f'!!! danger "{len(unauth)} routes have no authentication"',
            "",
            "    These routes accept requests without an access token. They are marked "
            "**None** below. See the [Implementation Status](../reference/implementation-status.md#security-gaps).",
            "",
        ]
    tag = None
    for t, method, path, who, limited, file, line, fn in sorted(rows, key=lambda r: (r[0], r[2], r[1])):
        if t != tag:
            lines += ["", f"## {t}", "", "| Method | Path | Auth | Rate limited | Handler |", "| --- | --- | --- | --- | --- |"]
            tag = t
        lines.append(f"| `{method}` | `{path}` | {who} | {'Yes' if limited else ''} | `{file}:{line}` `{fn}` |")
    out.write_text("\n".join(lines) + "\n")
    print(f"{len(rows)} routes, {len(unauth)} without authentication -> {out}")


if __name__ == "__main__":
    main()

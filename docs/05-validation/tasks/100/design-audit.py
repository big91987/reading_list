import gzip
import hashlib
import json
import re
import subprocess
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[4]
TASK = ROOT / "docs/04-implementation/tasks/100"
VALIDATION = Path(__file__).parent
RESULTS = {
    "main": 9,
    "touch": 10,
    "keyboard": 11,
    "security": 12,
    "failures": 7,
    "layout": 8,
}


def main():
    aliases = json.loads((VALIDATION / "evidence-aliases.json").read_text())["files"]
    alias_map = {
        str(ROOT / entry["path"]): ROOT / entry["canonical"] for entry in aliases
    }
    documents = list((TASK / "design").glob("*.md")) + [
        TASK / "prototype/README.md",
        TASK / "README.md",
        ROOT / "docs/README.md",
    ]
    documents += list((ROOT / "docs/01-architecture/tasks/100").glob("*.md"))
    documents += [
        VALIDATION / "design-validation.md",
        VALIDATION / "evidence-archive.md",
    ]
    link_count = 0
    for document in documents:
        for target in re.findall(r"\]\(([^)]+)\)", document.read_text()):
            if "://" in target or target.startswith("#"):
                continue
            path = (document.parent / target.split("#")[0]).resolve()
            if not path.exists() and str(path) not in alias_map:
                raise ValueError(f"Missing local reference: {document}: {target}")
            link_count += 1
    trace = (ROOT / "docs/01-architecture/tasks/100/traceability.md").read_text()
    for index in range(1, 12):
        if f"R-{index:02}" not in trace:
            raise ValueError("Missing requirement mapping")
    for index in range(1, 13):
        if f"AC-{index:02}" not in trace:
            raise ValueError("Missing acceptance mapping")
    ledger = (
        ROOT / "docs/01-architecture/tasks/100/architecture-decisions.md"
    ).read_text()
    rows = re.findall(r"\| (A-\d{3}) /", ledger)
    if len(rows) != 6 or len(set(rows)) != 6 or "下一个ID A-007" not in ledger:
        raise ValueError("Invalid architecture ledger")
    checks = []
    dependency_files = set(documents)
    dependency_files.update((TASK / "prototype").iterdir())
    dependency_files.update(VALIDATION.glob("*.py"))
    dependency_files.update(
        [
            VALIDATION / "evidence-aliases.json",
            VALIDATION / "design-source-recheck/report.json",
            VALIDATION / "source-poc/catalogue.json",
            VALIDATION / "source-poc/manifest.json",
            VALIDATION / "design-quality-fix.log",
            VALIDATION / "design-quality-check.log",
        ]
    )
    for name, sequence in RESULTS.items():
        plan_path = VALIDATION / f"browser-{name}.json"
        result_path = VALIDATION / f"browser/design-1-{sequence}/browser.json"
        executed_path = result_path.with_name("executed-plan.json")
        plan = json.loads(plan_path.read_text())
        result = json.loads(result_path.read_text())
        executed = json.loads(executed_path.read_text())
        if (
            not result["passed"]
            or result["errors"]
            or len(result["performed"]) != len(plan)
        ):
            raise ValueError("Incomplete browser evidence")
        for planned, actual in zip(plan, executed, strict=True):
            for key, value in planned.items():
                if actual[key] != value:
                    raise ValueError("Browser evidence not for current plan")
            if planned["action"] == "page_script":
                script = ROOT / planned["script"]
                if actual["source"] != script.read_text():
                    raise ValueError("Browser script changed since execution")
                dependency_files.add(script)
        checks.append(
            {
                "name": name,
                "passed": True,
                "actions": len(plan),
                "result": str(result_path.relative_to(ROOT)),
            }
        )
        dependency_files.update([plan_path, result_path, executed_path])
    for directory, manifest_name, responses_key in [
        (VALIDATION / "source-poc", "manifest.json", None),
        (VALIDATION / "design-source-recheck", "report.json", "requests"),
    ]:
        report = json.loads((directory / manifest_name).read_text())
        responses = report[responses_key] if responses_key else report
        for response in responses:
            data = gzip.decompress((directory / response["snapshot"]).read_bytes())
            if (
                hashlib.sha256(data).hexdigest() != response["sha256"]
                or len(data) != response["bytes"]
            ):
                raise ValueError("Source response bytes changed")
    for entry in aliases:
        data = (ROOT / entry["canonical"]).read_bytes()
        if (
            hashlib.sha256(data).hexdigest() != entry["sha256"]
            or len(data) != entry["bytes"]
        ):
            raise ValueError("Historical evidence changed")
    changed = subprocess.check_output(
        ["git", "diff", "--name-only"], cwd=ROOT, text=True
    ).splitlines()
    protected = [
        path
        for path in changed
        if path.startswith(
            ("app/", "scripts/", "deploy/", ".github/", "harness/", "full_harness/")
        )
        or path in ["harness-project.json", "harness-upstream.json"]
    ]
    if protected:
        raise ValueError(f"Unexpected product/protected changes: {protected}")
    hashes = {
        str(file.relative_to(ROOT)): hashlib.sha256(file.read_bytes()).hexdigest()
        for file in sorted(dependency_files)
        if file.is_file()
    }
    output = {
        "checked_at": datetime.now(timezone.utc).isoformat(),
        "passed": True,
        "markdown_files": len(documents),
        "local_links": link_count,
        "requirements": 11,
        "acceptances": 12,
        "architecture_decisions": 6,
        "browser_checks": checks,
        "browser_actions": sum(check["actions"] for check in checks),
        "source_snapshot_hashes": 14,
        "historical_png_alias_hashes": len(aliases),
        "product_or_protected_changes": protected,
        "design_dependency_sha256": hashes,
        "scope": "Design snapshot and evidence audit; not product or final QA acceptance",
    }
    (VALIDATION / "design-audit.json").write_text(
        json.dumps(output, ensure_ascii=False, indent=2) + "\n"
    )
    print(
        json.dumps(
            {
                key: value
                for key, value in output.items()
                if key != "design_dependency_sha256"
            },
            ensure_ascii=False,
            indent=2,
        )
    )


if __name__ == "__main__":
    main()

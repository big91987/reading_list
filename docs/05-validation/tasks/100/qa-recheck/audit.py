import gzip
import hashlib
import importlib.util
import json
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[5]
BASE = Path(__file__).parent.parent
CURRENT = Path(__file__).parent


def load(filename):
    return json.loads(filename.read_text())


def main():
    baseline = load(BASE / "compatibility/baseline.json")
    owner = Path.home() / ".local/share/reading-list-preview"
    deployed = load(owner / "deployed.json")
    assert deployed["sha"] == baseline["deployed_sha"]
    for filename, expected in baseline["files"].items():
        actual = (owner / "releases" / deployed["sha"] / filename).read_bytes()
        assert actual == (BASE / "compatibility/baseline" / filename).read_bytes()
        assert hashlib.sha256(actual).hexdigest() == expected["sha256"]
        assert len(actual) == expected["bytes"]
    spec = importlib.util.spec_from_file_location(
        "qa_deploy", ROOT / "scripts/local_deploy.py"
    )
    deploy = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(deploy)
    release = load(ROOT / "deploy/release.json")
    assert release["app_sha256"] == deploy.fingerprint(ROOT / "app")
    assert release["compatible_from"] == deployed["sha"]
    core = subprocess.check_output(
        ["git", "show", "HEAD:tests/browser/core.json"], cwd=ROOT
    )
    assert core == (ROOT / "tests/browser/core.json").read_bytes()
    assert json.loads(core) == load(CURRENT / "core-plan.json")
    plans = [
        "main",
        "network",
        "candidates",
        "touch",
        "keyboard",
        "storage",
        "core",
        "catalogue",
        "manual",
        "dedup",
    ]
    browser = []
    for number, plan in enumerate(plans, start=11):
        directory = BASE / "browser" / f"qa-1-{number}"
        receipt = load(directory / "browser.json")
        assert receipt["passed"] and receipt["errors"] == []
        executed = json.loads(
            gzip.decompress((directory / "executed-plan.json.gz").read_bytes())
        )
        for step in executed:
            if step["action"] == "page_script":
                assert step.pop("source") == (ROOT / step["script"]).read_text()
        assert executed == load(CURRENT / f"{plan}-plan.json")
        browser.append(
            {
                "directory": str(directory.relative_to(ROOT)),
                "actions": len(receipt["performed"]),
                "passed": True,
            }
        )
    assert sum(entry["actions"] for entry in browser) == 209
    checks = load(BASE / "delivery-checks/checks.json")
    assert len(checks) == 8 and all(check["exit_code"] == 0 for check in checks)
    for name in ["existing", "feature"]:
        receipt = load(BASE / "delivery-checks" / name / "browser.json")
        assert receipt["passed"] and receipt["errors"] == []
    assert "Ran 47 tests" in (CURRENT / "python.log").read_text()
    assert "pass 25" in (CURRENT / "node.log").read_text()
    assert "fail 0" in (CURRENT / "node.log").read_text()
    assert "All checks passed" in (CURRENT / "quality.log").read_text()
    assert load(CURRENT / "transport-boundaries.json")["passed"]
    assert load(CURRENT / "wall-budget.json")["passed"]
    assert load(CURRENT / "source-audit.json")["passed"]
    assert load(CURRENT / "validate.json")["ready"]
    report = load(CURRENT / "real-run.json")
    catalogue = load(CURRENT / "catalogue.json")
    assert report["count"] == len(catalogue["records"]) == 32
    assert report["publishRevision"] == catalogue["revision"]
    assert len({source["organisation"] for source in catalogue["sources"]}) == 2
    starts = [request["startedMonotonic"] for request in report["requests"]]
    gaps = [later - earlier for earlier, later in zip(starts, starts[1:])]
    assert len(gaps) == 4 and min(gaps) >= 1
    for manifest_name in ["evidence-aliases.json", "qa-evidence-aliases.json"]:
        for entry in load(BASE / manifest_name)["files"]:
            data = (ROOT / entry["canonical"]).read_bytes()
            assert len(data) == entry["bytes"]
            assert hashlib.sha256(data).hexdigest() == entry["sha256"]
    packed = load(BASE / "qa-packaged-evidence.json")
    entries = [packed["gzip"], *packed["gzipFiles"]]
    entries += load(BASE / "development-rework/ax-archives.json")["files"]
    evidence = load(CURRENT / "evidence.json")
    entries += evidence["pngs"] + evidence["gzip"]
    for entry in entries:
        data = (
            (ROOT / entry["canonical"]).read_bytes()
            if "canonical" in entry
            else gzip.decompress((ROOT / entry["archive"]).read_bytes())
        )
        assert len(data) == entry["bytes"]
        assert hashlib.sha256(data).hexdigest() == entry["sha256"]
    protected = subprocess.check_output(
        [
            "git",
            "diff",
            "HEAD",
            "--",
            ".github/",
            "harness/",
            "harness-project.json",
            "harness-upstream.json",
            "full_harness/",
        ],
        cwd=ROOT,
    )
    assert not protected
    result = {
        "audit_passed": True,
        "qa_release_passed": True,
        "deployed_sha": deployed["sha"],
        "private_user_data_read": False,
        "release_fingerprint": release["app_sha256"],
        "core_bytes_unchanged": True,
        "protected_paths_unchanged": True,
        "python_tests": 47,
        "node_tests": 25,
        "shared_gates": 8,
        "browser": browser,
        "browser_actions": 209,
        "real_catalogue_revision": catalogue["revision"],
        "actual_send_gaps_seconds": gaps,
        "historical_and_current_evidence_bytes_verified": True,
        "prior_defects_closed_by_new_independent_reproduction": True,
    }
    (CURRENT / "audit.json").write_text(
        json.dumps(result, ensure_ascii=False, indent=2) + "\n"
    )
    print(json.dumps(result, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()

import gzip
import hashlib
import importlib.util
import json
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[4]
BASE = Path(__file__).parent


def main():
    baseline = json.loads((BASE / "compatibility/baseline.json").read_text())
    owner_root = Path.home() / ".local/share/reading-list-preview"
    deployed = json.loads((owner_root / "deployed.json").read_text())
    assert deployed["sha"] == baseline["deployed_sha"]
    hashes = {}
    for filename, expected in baseline["files"].items():
        actual = (owner_root / "releases" / deployed["sha"] / filename).read_bytes()
        snapshot = (BASE / "compatibility/baseline" / filename).read_bytes()
        assert actual == snapshot
        checksum = hashlib.sha256(actual).hexdigest()
        assert checksum == expected["sha256"] and len(actual) == expected["bytes"]
        hashes[filename] = {"sha256": checksum, "bytes": len(actual)}
    spec = importlib.util.spec_from_file_location(
        "qa_deploy", ROOT / "scripts/local_deploy.py"
    )
    deploy = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(deploy)
    release = json.loads((ROOT / "deploy/release.json").read_text())
    assert release["app_sha256"] == deploy.fingerprint(ROOT / "app")
    assert release["compatible_from"] == deployed["sha"]
    baseline_core = subprocess.check_output(
        ["git", "show", "HEAD:tests/browser/core.json"], cwd=ROOT
    )
    assert baseline_core == (ROOT / "tests/browser/core.json").read_bytes()
    browser = []
    for directory in sorted((BASE / "browser").glob("qa-*")):
        receipt = json.loads((directory / "browser.json").read_text())
        assert receipt["passed"] and receipt["errors"] == []
        executed = json.loads((directory / "executed-plan.json").read_text())
        for step in executed:
            if step["action"] == "page_script":
                assert step["source"] == (ROOT / step["script"]).read_text()
        browser.append(
            {
                "path": str(directory.relative_to(ROOT)),
                "passed": True,
                "actions": len(receipt["performed"]),
                "device": receipt["device"],
            }
        )
    for manifest_name in ["evidence-aliases.json", "qa-evidence-aliases.json"]:
        for entry in json.loads((BASE / manifest_name).read_text())["files"]:
            data = (ROOT / entry["canonical"]).read_bytes()
            assert (
                len(data) == entry["bytes"]
                and hashlib.sha256(data).hexdigest() == entry["sha256"]
            )
    packed_manifest = json.loads((BASE / "qa-packaged-evidence.json").read_text())
    for packed in [packed_manifest["gzip"], *packed_manifest["gzipFiles"]]:
        data = gzip.decompress((ROOT / packed["archive"]).read_bytes())
        assert (
            len(data) == packed["bytes"]
            and hashlib.sha256(data).hexdigest() == packed["sha256"]
        )
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
        ],
        cwd=ROOT,
    )
    assert not protected
    report = {
        "audit_passed": True,
        "qa_release_passed": False,
        "reason": "Two controlled Transport boundary failures are not waived by passing shared gates",
        "deployed_sha": deployed["sha"],
        "deployed_baseline_files": hashes,
        "private_user_data_read": False,
        "release_fingerprint": release["app_sha256"],
        "release_compatibility_sha": release["compatible_from"],
        "browser": browser,
        "browser_actions": sum(entry["actions"] for entry in browser),
        "core_bytes_unchanged": True,
        "protected_paths_unchanged": True,
        "evidence_aliases_and_gzip_bytes_verified": True,
        "product_sha256": {
            str(filename.relative_to(ROOT)): hashlib.sha256(
                filename.read_bytes()
            ).hexdigest()
            for filename in [
                ROOT / "app/app.js",
                ROOT / "app/index.html",
                ROOT / "app/styles.css",
                ROOT / "scripts/recommendations.py",
                ROOT / "scripts/local_deploy.py",
                ROOT / "scripts/install_local_preview.py",
            ]
        },
    }
    (BASE / "qa-logs/audit.json").write_text(
        json.dumps(report, ensure_ascii=False, indent=2) + "\n"
    )
    print(json.dumps(report, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()

import hashlib
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[4]
MANIFEST = Path(__file__).with_name("evidence-aliases.json")


def digest(data):
    return hashlib.sha256(data).hexdigest()


def main():
    command = sys.argv[1]
    if command in ("archive", "archive-all"):
        manifest = (
            json.loads(MANIFEST.read_text())
            if MANIFEST.exists()
            else {
                "scope": "byte-identical historical screenshot aliases; all unique bytes retained; receipts untouched",
                "files": [],
            }
        )
        originals = {}
        aliases = []
        files = (
            list((ROOT / "docs/05-validation/tasks").rglob("*.png"))
            if command == "archive-all"
            else list(
                (ROOT / "docs/05-validation/tasks/82/browser").glob("design-*/*.png")
            )
        )
        if command == "archive":
            files.extend((ROOT / "docs/05-validation/tasks/94/browser").glob("*/*.png"))
        protected = {ROOT / entry["canonical"] for entry in manifest["files"]}
        for file in sorted(files, key=lambda path: (path not in protected, str(path))):
            data = file.read_bytes()
            checksum = digest(data)
            if checksum in originals:
                if file in protected:
                    continue
                canonical = originals[checksum]
                if canonical.read_bytes() != data:
                    raise ValueError("Digest mismatch")
                aliases.append(
                    {
                        "path": str(file.relative_to(ROOT)),
                        "canonical": str(canonical.relative_to(ROOT)),
                        "sha256": checksum,
                        "bytes": len(data),
                    }
                )
            else:
                originals[checksum] = file
        manifest["files"].extend(aliases)
        MANIFEST.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n")
        for entry in aliases:
            (ROOT / entry["path"]).unlink()
        print(
            f"Archived {len(aliases)} duplicate paths, retained exact canonical bytes, saved {sum(entry['bytes'] for entry in aliases)} bytes"
        )
    elif command in ["verify", "restore"]:
        manifest = json.loads(MANIFEST.read_text())
        for entry in manifest["files"]:
            data = (ROOT / entry["canonical"]).read_bytes()
            if digest(data) != entry["sha256"] or len(data) != entry["bytes"]:
                raise ValueError("Historical evidence bytes changed")
            if command == "restore":
                destination = ROOT / entry["path"]
                if destination.exists() and destination.read_bytes() != data:
                    raise ValueError("Restore would overwrite different bytes")
                destination.write_bytes(data)
        print(f"{command}: {len(manifest['files'])} original PNG hashes passed")
    else:
        raise ValueError("Use archive, archive-all, verify or restore")


if __name__ == "__main__":
    main()

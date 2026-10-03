#!/usr/bin/env python3
"""Install the trusted deployment controller and launchd service once on this Mac."""

import argparse
import os
import plistlib
import shutil
import subprocess
import sys
from pathlib import Path


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--root", type=Path, default=Path.home() / ".local/share/reading-list-preview"
    )
    args = parser.parse_args()
    root = args.root.expanduser().resolve()
    for name in ("controller", "logs", "plans", "releases", "data"):
        (root / name).mkdir(parents=True, exist_ok=True)
    repository = root / "repository"
    if not repository.exists():
        subprocess.run(
            [
                "git",
                "clone",
                "--no-checkout",
                "https://github.com/big91987/reading_list.git",
                str(repository),
            ],
            check=True,
        )
    controller = root / "controller/local_deploy.py"
    shutil.copyfile(Path(__file__).with_name("local_deploy.py"), controller)
    label = "com.reading-list.preview"
    plist = Path.home() / "Library/LaunchAgents" / (label + ".plist")
    plist.parent.mkdir(parents=True, exist_ok=True)
    config = {
        "Label": label,
        "ProgramArguments": [
            sys.executable,
            str(controller),
            "serve",
            "--root",
            str(root),
        ],
        "RunAtLoad": True,
        "KeepAlive": True,
        "StandardOutPath": str(root / "logs/server.log"),
        "StandardErrorPath": str(root / "logs/server-error.log"),
        "WorkingDirectory": str(root),
    }
    plist.write_bytes(plistlib.dumps(config))
    domain = f"gui/{os.getuid()}"
    subprocess.run(["launchctl", "bootout", domain + "/" + label], capture_output=True)
    subprocess.run(["launchctl", "bootstrap", domain, str(plist)], check=True)
    print(
        "Service installed on http://127.0.0.1:5533; no release is changed by installation."
    )
    print("Set GitHub variable READING_LIST_DEPLOY_ROOT to " + str(root))


if __name__ == "__main__":
    main()

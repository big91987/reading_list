import fcntl
import json
import os
import plistlib
import tempfile
import unittest
from pathlib import Path
from urllib.parse import urljoin


class RuntimeMechanismTests(unittest.TestCase):
    def test_version_base_does_not_capture_absolute_catalogue_path(self):
        self.assertEqual(
            urljoin(
                "http://127.0.0.1:5533/_releases/test/",
                "/__recommendations/catalogue.json",
            ),
            "http://127.0.0.1:5533/__recommendations/catalogue.json",
        )

    def test_advisory_lock_excludes_parallel_holder_and_releases(self):
        with tempfile.TemporaryDirectory() as temporary:
            lock_path = Path(temporary) / "worker.lock"
            with lock_path.open("a+") as first, lock_path.open("a+") as second:
                fcntl.flock(first, fcntl.LOCK_EX | fcntl.LOCK_NB)
                with self.assertRaises(BlockingIOError):
                    fcntl.flock(second, fcntl.LOCK_EX | fcntl.LOCK_NB)
                fcntl.flock(first, fcntl.LOCK_UN)
                fcntl.flock(second, fcntl.LOCK_EX | fcntl.LOCK_NB)

    def test_staged_interruption_preserves_old_then_replace_publishes_whole(self):
        with tempfile.TemporaryDirectory() as temporary:
            directory = Path(temporary)
            live = directory / "catalogue.json"
            staged = directory / "catalogue.tmp"
            live.write_text('{"revision":"old"}')
            with staged.open("w") as stream:
                json.dump({"revision": "new", "records": list(range(34))}, stream)
                stream.flush()
                os.fsync(stream.fileno())
            self.assertEqual(json.loads(live.read_text())["revision"], "old")
            os.replace(staged, live)
            self.assertEqual(len(json.loads(live.read_text())["records"]), 34)

    def test_plist_round_trip_preserves_tick_and_non_destructive_install_scope(self):
        configuration = {
            "Label": "com.reading-list.recommendations",
            "ProgramArguments": [
                "/usr/bin/python3",
                "/persistent/controller/recommendations.py",
                "tick",
                "--root",
                "/persistent",
            ],
            "RunAtLoad": True,
            "StartInterval": 3600,
        }
        self.assertEqual(plistlib.loads(plistlib.dumps(configuration)), configuration)
        self.assertEqual(configuration["StartInterval"], 3600)
        self.assertNotIn("releases", " ".join(configuration["ProgramArguments"]))


if __name__ == "__main__":
    unittest.main(verbosity=2)

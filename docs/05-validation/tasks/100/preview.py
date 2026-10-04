"""Development-only preview of current app and a temporary collector root."""

import argparse
import http.server
import importlib.util
import json
import urllib.parse
from pathlib import Path

WORKSPACE = Path(__file__).resolve().parents[4]
spec = importlib.util.spec_from_file_location(
    "recommendations", WORKSPACE / "scripts/recommendations.py"
)
collector = importlib.util.module_from_spec(spec)
spec.loader.exec_module(collector)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root", required=True, type=Path)
    parser.add_argument("--port", type=int, default=5534)
    args = parser.parse_args()
    root = args.root.resolve()
    file = root / "recommendations/catalogue.json"

    class Handler(http.server.SimpleHTTPRequestHandler):
        def __init__(self, *handler_args, **kwargs):
            super().__init__(*handler_args, directory=str(WORKSPACE / "app"), **kwargs)

        def do_GET(self):
            path = urllib.parse.urlsplit(self.path).path
            if path.startswith("/__recommendations/"):
                if path != "/__recommendations/catalogue.json":
                    self.send_error(404)
                    return
                try:
                    body = file.read_bytes()
                    collector.validate_catalogue(json.loads(body))
                except (OSError, ValueError):
                    self.send_error(503)
                    return
                self.send_response(200)
                self.send_header("Content-Type", "application/json; charset=utf-8")
                self.send_header("Content-Length", str(len(body)))
                self.send_header("Cache-Control", "no-store")
                self.send_header("X-Content-Type-Options", "nosniff")
                self.end_headers()
                self.wfile.write(body)
                return
            if path not in {"/", "/index.html", "/app.js", "/styles.css"}:
                self.send_error(404)
                return
            super().do_GET()

    print(
        f"Development only: http://127.0.0.1:{args.port}; no installed service or release is modified",
        flush=True,
    )
    http.server.ThreadingHTTPServer(("127.0.0.1", args.port), Handler).serve_forever()


if __name__ == "__main__":
    main()

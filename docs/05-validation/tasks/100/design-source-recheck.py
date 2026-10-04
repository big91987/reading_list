import gzip
import hashlib
import importlib.util
import json
import time
from datetime import datetime, timezone
from pathlib import Path
from urllib.request import Request, build_opener


def main():
    root = Path(__file__).parent
    spec = importlib.util.spec_from_file_location("source_poc", root / "source-poc.py")
    parser = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(parser)
    catalogue = json.loads((root / "source-poc/catalogue.json").read_text())
    opener = build_opener(parser.SafeRedirect())
    output = root / "design-source-recheck"
    output.mkdir(exist_ok=True)
    manifest = []
    records = []
    for index in [0, 30, 32]:
        expected = catalogue["records"][index]
        url = expected["url"]
        parser.validate_url(url)
        requested_at = datetime.now(timezone.utc).isoformat()
        request = Request(
            url, headers={"User-Agent": parser.USER_AGENT, "Accept": "text/html"}
        )
        with opener.open(request, timeout=25) as response:
            raw = response.read(2 * 1024 * 1024 + 1)
            if len(raw) > 2 * 1024 * 1024:
                raise ValueError("Response too large")
            encoding = response.headers.get_content_charset() or "utf-8"
            final_url = response.geturl()
            parser.validate_url(final_url)
            html = raw.decode(encoding)
            parsed = (
                parser.parse_writer(html, final_url)
                if index == 0
                else [parser.parse_library(html, final_url)]
            )
            if not any(
                book["title"] == expected["title"]
                and book["author"] == expected["author"]
                for book in parsed
            ):
                raise ValueError("Source identity no longer matches")
            snapshot = f"response-{index}.html.gz"
            (output / snapshot).write_bytes(gzip.compress(raw, mtime=0))
            manifest.append(
                {
                    "requested_at": requested_at,
                    "url": url,
                    "final_url": final_url,
                    "status": response.status,
                    "content_type": response.headers.get("Content-Type"),
                    "encoding": encoding,
                    "bytes": len(raw),
                    "sha256": hashlib.sha256(raw).hexdigest(),
                    "snapshot": snapshot,
                    "parsed_count": len(parsed),
                }
            )
            records.extend(parsed)
        time.sleep(1)
    types = sorted({book["types"][0] for book in records})
    sources = sorted({book["source"] for book in records})
    if len(sources) != 2 or len(types) < 3:
        raise ValueError(
            "Recheck must retain two official sources and three nonempty basic types"
        )
    result = {
        "checked_at": datetime.now(timezone.utc).isoformat(),
        "requests": manifest,
        "source_count": len(sources),
        "sources": sources,
        "basic_types": types,
        "parsed_records": len(records),
        "passed": True,
        "scope": "Selected source identity and parsing recheck, not production collection/scheduling or publication permission",
        "permission_granted": False,
    }
    (output / "report.json").write_text(
        json.dumps(result, ensure_ascii=False, indent=2) + "\n"
    )
    print(json.dumps(result, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()

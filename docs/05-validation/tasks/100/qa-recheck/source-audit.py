import gzip
import hashlib
import importlib.util
import json
from pathlib import Path

WORKSPACE = Path(__file__).resolve().parents[5]
OUTPUT = Path(__file__).parent
spec = importlib.util.spec_from_file_location(
    "qa_source_product", WORKSPACE / "scripts/recommendations.py"
)
product = importlib.util.module_from_spec(spec)
spec.loader.exec_module(product)


def main():
    root = Path("/private/tmp/reading-list-100-qa-recheck/recommendations")
    catalogue = product.validate_catalogue(
        json.loads((root / "catalogue.json").read_text())
    )
    (OUTPUT / "catalogue.json").write_bytes((root / "catalogue.json").read_bytes())
    transport = product.Transport()
    samples = []
    for source_id, title, author in (
        ("writer", "屯堡", "冉正万"),
        ("fjlib", "梅西传", "莱文斯基"),
    ):
        selected = next(
            record for record in catalogue["records"] if record["title"] == title
        )
        origin = next(
            origin for origin in selected["origins"] if origin["sourceId"] == source_id
        )
        html = transport.fetch(origin["url"], source_id)
        assert title in html and author in html
        assert product.SOURCES[source_id]["organisation"] in html
        if source_id == "writer":
            assert "入围" in html
        else:
            assert "新书推荐" in html
        raw = html.encode("utf-8")
        snapshot = f"source-{source_id}.html.gz"
        (OUTPUT / snapshot).write_bytes(gzip.compress(raw, mtime=0))
        samples.append(
            {
                "title": title,
                "sourceId": source_id,
                "url": origin["url"],
                "organisation": origin["organisation"],
                "title_author_organisation_and_recommendation_checked": True,
                "summary": selected["summary"],
                "snapshot": snapshot,
                "decoded_utf8_sha256": hashlib.sha256(raw).hexdigest(),
            }
        )
    result = {
        "passed": True,
        "records": len(catalogue["records"]),
        "organisations": sorted(
            {
                origin["organisation"]
                for record in catalogue["records"]
                for origin in record["origins"]
            }
        ),
        "types": sorted(
            {kind for record in catalogue["records"] for kind in record["types"]}
        ),
        "revision": catalogue["revision"],
        "samples": samples,
        "requests": transport.requests,
        "permissionGranted": False,
        "method": "QA reruns formal CLI in isolated temporary root, then rerequests one concrete recommendation page per organisation and checks title/author/organisation/recommendation wording independently of parser",
    }
    (OUTPUT / "source-audit.json").write_text(
        json.dumps(result, ensure_ascii=False, indent=2) + "\n"
    )
    print(json.dumps(result, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()

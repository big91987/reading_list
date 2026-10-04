import json
import urllib.error
import urllib.request


def main():
    results = []
    for url in [
        "https://www.nlc.cn/web/index.shtml",
        "https://www.chinawriter.com.cn/",
    ]:
        try:
            with urllib.request.urlopen(url, timeout=15) as response:
                payload = response.read()
                results.append(
                    {"url": url, "status": response.status, "bytes": len(payload)}
                )
        except (urllib.error.URLError, TimeoutError) as error:
            results.append(
                {"url": url, "error_type": type(error).__name__, "error": str(error)}
            )
    print(
        json.dumps(
            {
                "purpose": "Reachability only, not collection or content permission proof",
                "results": results,
            },
            ensure_ascii=False,
            indent=2,
        )
    )


if __name__ == "__main__":
    main()

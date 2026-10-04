import importlib.util
import json
from contextlib import ExitStack
from pathlib import Path
from types import SimpleNamespace
from unittest.mock import patch

WORKSPACE = Path(__file__).resolve().parents[4]
spec = importlib.util.spec_from_file_location(
    "qa_recommendations", WORKSPACE / "scripts/recommendations.py"
)
product = importlib.util.module_from_spec(spec)
spec.loader.exec_module(product)


def probe(first_dns_delay, fetch_count):
    clock = {"now": 100.0, "dns_count": 0}
    starts = []
    sleeps = []

    def sleep(duration):
        sleeps.append(duration)
        clock["now"] += duration

    def resolve(*args, **kwargs):
        clock["dns_count"] += 1
        if clock["dns_count"] == 1:
            clock["now"] += first_dns_delay
        return [(2, 1, 6, "", ("93.184.216.34", 443))]

    class Connection:
        def __init__(self, hostname, timeout):
            self.timeout = timeout

        def request(self, method, path, headers):
            starts.append({"time": clock["now"], "method": method, "path": path})

        def getresponse(self):
            return SimpleNamespace(
                status=200,
                read=lambda limit: b"<html>ok</html>",
                getheader=lambda name, default="": "text/html; charset=utf-8",
            )

        def close(self):
            return None

    failure = None
    with ExitStack() as stack:
        stack.enter_context(
            patch.object(product.time, "monotonic", lambda: clock["now"])
        )
        stack.enter_context(patch.object(product.time, "time", lambda: clock["now"]))
        stack.enter_context(patch.object(product.time, "sleep", sleep))
        stack.enter_context(patch.object(product.socket, "getaddrinfo", resolve))
        stack.enter_context(
            patch.object(product.socket, "create_connection", return_value=object())
        )
        stack.enter_context(
            patch.object(product.http.client, "HTTPSConnection", Connection)
        )
        stack.enter_context(
            patch.object(
                product.ssl,
                "create_default_context",
                return_value=SimpleNamespace(
                    wrap_socket=lambda connection, server_hostname: connection
                ),
            )
        )
        transport = product.Transport()
        for unused in range(fetch_count):
            try:
                transport.fetch(product.SOURCES["writer"]["pages"][0], "writer")
            except product.Failure as error:
                failure = error.code
                break
    return {
        "dns_delay_seconds": first_dns_delay,
        "deadline": transport.deadline,
        "http_request_starts": starts,
        "sleeps": sleeps,
        "failure": failure,
        "external_network_used": False,
    }


def main():
    spacing = probe(2.0, 2)
    spacing["actual_gap_seconds"] = (
        spacing["http_request_starts"][1]["time"]
        - spacing["http_request_starts"][0]["time"]
    )
    spacing["passed"] = spacing["actual_gap_seconds"] >= 1.0
    deadline = probe(301.0, 1)
    deadline["passed"] = not deadline["http_request_starts"]
    result = {
        "method": "Execute unchanged product Transport with controlled DNS/clock/socket boundaries; HTTP request() records actual dispatch time, not response-completion requestedAt",
        "requirement": "HLD section 5: minimum 1-second request spacing and maximum 5-minute round; Trellis backend repeats these limits",
        "spacing": spacing,
        "deadline": deadline,
        "passed": spacing["passed"] and deadline["passed"],
    }
    print(json.dumps(result, ensure_ascii=False, indent=2))
    return 0 if result["passed"] else 1


if __name__ == "__main__":
    raise SystemExit(main())

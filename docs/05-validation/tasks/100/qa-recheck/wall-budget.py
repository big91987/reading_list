import importlib.util
import json
import threading
import time
from contextlib import ExitStack
from pathlib import Path
from types import SimpleNamespace
from unittest.mock import patch

ROOT = Path(__file__).resolve().parents[5]
spec = importlib.util.spec_from_file_location(
    "qa_wall_product", ROOT / "scripts/recommendations.py"
)
product = importlib.util.module_from_spec(spec)
spec.loader.exec_module(product)


def probe(stage):
    release = threading.Event()
    returned = threading.Event()
    closed = threading.Event()
    calls = []

    def resolve(*args, **kwargs):
        calls.append("dns")
        if stage == "dns":
            release.wait(2)
            returned.set()
        return [(2, 1, 6, "", ("93.184.216.34", 443))]

    def connect(*args, **kwargs):
        calls.append("connect")
        if stage == "connect":
            release.wait(2)
            returned.set()
        return SimpleNamespace(close=closed.set)

    class Connection:
        def __init__(self, *args, **kwargs):
            self.sock = None

        def close(self):
            if self.sock:
                self.sock.close()

    with ExitStack() as stack:
        stack.enter_context(patch.object(product.socket, "getaddrinfo", resolve))
        stack.enter_context(patch.object(product.socket, "create_connection", connect))
        stack.enter_context(
            patch.object(product.http.client, "HTTPSConnection", Connection)
        )
        transport = product.Transport()
        transport.deadline = time.monotonic() + 0.08
        started = time.monotonic()
        code = None
        try:
            transport.fetch(product.SOURCES["writer"]["pages"][0], "writer")
        except product.Failure as error:
            code = error.code
        elapsed = time.monotonic() - started
        calls_at_return = list(calls)
        assert code == "size_limit" and elapsed < 0.5
        assert not release.is_set()
        release.set()
        assert returned.wait(0.5)
        if stage == "dns":
            time.sleep(0.02)
            assert calls == ["dns"]
        else:
            assert closed.wait(0.5)
        return {
            "stage": stage,
            "budget_seconds": 0.08,
            "elapsed_seconds": elapsed,
            "failure": code,
            "calls_at_return": calls_at_return,
            "calls_after_late_result": calls,
            "late_socket_closed": closed.is_set(),
            "passed": True,
        }


if __name__ == "__main__":
    results = [probe("dns"), probe("connect")]
    print(
        json.dumps(
            {
                "passed": True,
                "external_network_used": False,
                "method": "Real wall-clock bounded waits; release blocked operation only after fetch returns, then assert no late DNS continuation and late socket cleanup",
                "results": results,
            },
            ensure_ascii=False,
            indent=2,
        )
    )

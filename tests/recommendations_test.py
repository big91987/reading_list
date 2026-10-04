import gzip
import importlib.util
import io
import json
import sys
import tempfile
import threading
import unittest
import urllib.error
import urllib.request
from contextlib import ExitStack, redirect_stdout
from pathlib import Path
from types import SimpleNamespace
from unittest.mock import patch

SCRIPTS = Path(__file__).resolve().parents[1] / "scripts"


def import_script(name):
    spec = importlib.util.spec_from_file_location(name, SCRIPTS / (name + ".py"))
    module = importlib.util.module_from_spec(spec)
    sys.modules[name] = module
    spec.loader.exec_module(module)
    return module


install_local_preview = import_script("install_local_preview")
local_deploy = import_script("local_deploy")
product = import_script("recommendations")

EVIDENCE = Path(__file__).resolve().parents[1] / "docs/05-validation/tasks/100"


class FixtureTransport:
    def __init__(self, failed=None, robots=None):
        self.failed = failed
        self.robots = robots
        self.requests = []

    def fetch(self, url, source_id, robots=False):
        self.requests.append({"url": url, "sourceId": source_id})
        if source_id == self.failed:
            raise product.Failure("network")
        if robots:
            return self.robots
        if source_id == "writer":
            name = "response-0.html.gz"
        elif "481274" in url:
            name = "response-30.html.gz"
        else:
            name = "response-32.html.gz"
        return gzip.decompress(
            (EVIDENCE / "design-source-recheck" / name).read_bytes()
        ).decode()


class CollectorTest(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name) / "recommendations"
        product.init(self.root)

    def run_collection(self, now=1791100000, transport=None):
        return product.collect(
            self.root, clock=lambda: now, transport=transport or FixtureTransport()
        )

    def test_initially_disabled_and_init_is_idempotent(self):
        before = (self.root / "state.json").read_bytes()
        product.init(self.root)
        self.assertEqual(before, (self.root / "state.json").read_bytes())
        transport = FixtureTransport()
        self.assertEqual(
            product.collect(self.root, "tick", transport=transport)["result"],
            "disabled",
        )
        self.assertEqual(transport.requests, [])

    def test_two_sources_three_types_and_no_full_reviews(self):
        result = self.run_collection()
        self.assertEqual(result["exitCode"], 0)
        self.assertEqual(result["count"], 32)
        catalogue = product.load(self.root / "catalogue.json")
        product.validate_catalogue(catalogue)
        self.assertEqual(catalogue["coverage"], "ready")
        self.assertEqual(
            {kind for entry in catalogue["records"] for kind in entry["types"]},
            {"历史社科", "科普", "现当代文学"},
        )
        self.assertFalse(result["permissionGranted"])
        self.assertTrue(
            all(len(entry["summary"]) <= 300 for entry in catalogue["records"])
        )
        self.assertNotIn("intro_evidence", json.dumps(catalogue))
        self.assertEqual(len(result["summaryEvidence"]), 32)

    def test_due_clock_login_recovery_and_no_catchup_loop(self):
        initial = self.run_collection()
        product.configure(self.root, "enable")
        self.run_collection()
        transport = FixtureTransport()
        now = initial["nextAttempt"] - 1
        self.assertEqual(
            product.collect(self.root, "tick", lambda: now, transport)["result"],
            "not_due",
        )
        self.assertEqual(transport.requests, [])
        result = product.collect(
            self.root, "tick", lambda: now + 30 * product.WEEK, transport
        )
        self.assertEqual(result["exitCode"], 0)
        self.assertEqual(len(transport.requests), 5)

    def test_partial_retains_last_success_and_hour_backoff(self):
        self.run_collection()
        before = product.load(self.root / "source-cache/fjlib.json")
        result = self.run_collection(1791100100, FixtureTransport(failed="fjlib"))
        catalogue = product.load(self.root / "catalogue.json")
        self.assertEqual(catalogue["status"], "partial")
        self.assertEqual(result["exitCode"], 1)
        self.assertEqual(result["nextAttempt"], 1791103700)
        self.assertEqual(before, product.load(self.root / "source-cache/fjlib.json"))
        self.assertEqual(len(catalogue["records"]), 32)

    def test_first_all_failure_no_catalogue(self):
        transport = FixtureTransport()
        transport.fetch = lambda *args, **kwargs: (_ for _ in ()).throw(
            product.Failure("network")
        )
        result = self.run_collection(transport=transport)
        self.assertEqual(result["exitCode"], 1)
        self.assertFalse((self.root / "catalogue.json").exists())

    def test_budget_failure_preserves_snapshots_reports_due_and_releases_lock(self):
        self.run_collection()
        before = {
            source: (self.root / "source-cache" / (source + ".json")).read_bytes()
            for source in product.SOURCES
        }
        transport = FixtureTransport()
        transport.fetch = lambda *args, **kwargs: (_ for _ in ()).throw(
            product.Failure("size_limit")
        )
        result = self.run_collection(1791100100, transport)
        self.assertEqual(result["errorCode"], "size_limit")
        self.assertEqual(result["exitCode"], 1)
        self.assertEqual(result["nextAttempt"], 1791103700)
        catalogue = product.load(self.root / "catalogue.json")
        self.assertEqual(catalogue["status"], "failed")
        self.assertEqual(len(catalogue["records"]), 32)
        for source, raw in before.items():
            self.assertEqual(
                raw, (self.root / "source-cache" / (source + ".json")).read_bytes()
            )
        with product.locked(self.root):
            self.assertEqual(
                product.load(self.root / "state.json")["nextAttempt"],
                result["nextAttempt"],
            )

    def test_later_all_failure_keeps_records(self):
        self.run_collection()
        transport = FixtureTransport()
        transport.fetch = lambda *args, **kwargs: (_ for _ in ()).throw(
            product.Failure("network")
        )
        self.run_collection(1791100100, transport)
        catalogue = product.load(self.root / "catalogue.json")
        self.assertEqual(catalogue["status"], "failed")
        self.assertEqual(len(catalogue["records"]), 32)

    def test_policy_pauses_source_and_keeps_old(self):
        self.run_collection()
        self.run_collection(
            1791100100, FixtureTransport(robots="User-agent: *\nDisallow: /")
        )
        self.assertTrue(
            all(
                not source["enabled"]
                for source in product.validate_config(self.root)["sources"].values()
            )
        )
        transport = FixtureTransport()
        self.run_collection(1791100200, transport)
        self.assertEqual(transport.requests, [])

    def test_identity_preserves_edition_and_uncertainty(self):
        raw = {
            "title": "A",
            "author": "B",
            "publisher": "C",
            "summary": "简介",
            "genre": "科幻",
            "types": ["现当代文学"],
        }
        url = product.SOURCES["writer"]["pages"][0]
        first = product.record(raw, "writer", url, product.stamp(0))
        second = product.record(
            {**raw, "edition": "2"}, "writer", url, product.stamp(0)
        )
        self.assertNotEqual(first["id"], second["id"])
        uncertain = product.record(
            {**raw, "publisher": None}, "writer", url, product.stamp(0)
        )
        self.assertNotEqual(first["id"], uncertain["id"])

    def test_missing_intro_fails_entire_writer_page(self):
        html = '<div class="end_article"><p>长篇小说</p><p>《书》</p><p>作者：某人</p></div>'
        with self.assertRaises(product.Failure):
            product.parse(html, "writer", product.SOURCES["writer"]["pages"][0])

    def test_factual_library_rule_rejects_unproven_claim(self):
        html = '<div class="TRS_Editor">题名：梅西传 作者：某人 出版社：某社 索书号：K1 内容简介：无相关事实</div>'
        with self.assertRaises(product.Failure):
            product.parse(html, "fjlib", product.SOURCES["fjlib"]["pages"][0])

    def test_lock_busy_emits_no_requests(self):
        transport = FixtureTransport()
        with product.locked(self.root), self.assertRaisesRegex(product.Failure, "busy"):
            self.run_collection(transport=transport)
        self.assertEqual(transport.requests, [])

    def test_atomic_replace_interruption_preserves_original(self):
        path = self.root / "sample.json"
        product.save(path, {"old": True})
        original = path.read_bytes()
        with (
            patch.object(product.os, "replace", side_effect=OSError("interrupted")),
            self.assertRaises(OSError),
        ):
            product.save(path, {"new": True})
        self.assertEqual(path.read_bytes(), original)
        self.assertFalse(path.with_name("sample.json.tmp").exists())

    def test_report_failure_does_not_rollback_published_catalogue(self):
        original_save = product.save

        def failing_save(path, value):
            if path.parent.name == "reports":
                raise OSError("report disk failure")
            original_save(path, value)

        with (
            patch.object(product, "save", side_effect=failing_save),
            self.assertRaises(OSError),
        ):
            self.run_collection()
        product.validate_catalogue(product.load(self.root / "catalogue.json"))

    def test_removed_source_never_reappears_and_enable_is_rejected(self):
        self.run_collection()
        product.configure(self.root, "remove", "fjlib")
        transport = FixtureTransport()
        self.run_collection(1791100100, transport)
        self.assertTrue(
            all(request["sourceId"] == "writer" for request in transport.requests)
        )
        self.assertEqual(len(product.load(self.root / "catalogue.json")["records"]), 30)
        with self.assertRaises(product.Failure):
            product.configure(self.root, "enable", "fjlib")

    def test_reenable_after_legitimate_source_exit_and_pause_keeps_due_time(self):
        self.run_collection()
        due = product.load(self.root / "state.json")["nextAttempt"]
        product.configure(self.root, "enable")
        self.assertEqual(product.load(self.root / "state.json")["nextAttempt"], due)
        product.configure(self.root, "remove", "fjlib")
        product.configure(self.root, "disable")
        product.configure(self.root, "enable")
        self.assertTrue(product.load(self.root / "state.json")["enabled"])
        self.assertEqual(
            product.load(self.root / "catalogue.json")["coverage"],
            "coverage_insufficient",
        )

    def test_multisource_merge_and_remove_switches_summary_evidence(self):
        self.run_collection()
        value = product.load(self.root / "catalogue.json")
        writer = value["records"][0]
        alternate = json.loads(json.dumps(writer))
        alternate["summary"] = "剩余来源的简介"
        alternate["origins"] = value["records"][-1]["origins"]
        alternate["summaryOrigin"]["evidenceSourceId"] = "fjlib"
        merged = product.merge_records([writer, alternate, alternate])
        self.assertEqual(len(merged), 1)
        self.assertEqual(len(merged[0]["origins"]), 2)
        product.save(
            self.root / "source-cache/fjlib.json",
            {"records": [alternate], "lastSuccessAt": product.stamp(1791100000)},
        )
        product.configure(self.root, "remove", "writer")
        remaining = product.load(self.root / "catalogue.json")["records"]
        self.assertEqual(remaining[0]["summary"], "剩余来源的简介")
        self.assertEqual(remaining[0]["summaryOrigin"]["evidenceSourceId"], "fjlib")

    def test_state_restores_due_from_published_envelope(self):
        self.run_collection()
        state = product.load(self.root / "state.json")
        state.update(enabled=True, lastAttempt=0, nextAttempt=0)
        product.save(self.root / "state.json", state)
        transport = FixtureTransport()
        result = product.collect(self.root, "tick", lambda: 1791100001, transport)
        self.assertEqual(result["result"], "not_due")
        self.assertEqual(transport.requests, [])

    def test_uninstall_cli_preserves_data_and_only_removes_own_worker(self):
        import subprocess

        self.run_collection()
        before = (self.root / "catalogue.json").read_bytes()
        home = Path(self.temp.name) / "home"
        plist = home / "Library/LaunchAgents/com.reading-list.recommendations.plist"
        plist.parent.mkdir(parents=True)
        plist.write_text("worker fixture")
        with (
            patch.object(product.Path, "home", return_value=home),
            patch.object(
                sys,
                "argv",
                ["recommendations.py", "uninstall", "--root", str(self.root.parent)],
            ),
            patch.object(
                subprocess, "run", return_value=SimpleNamespace(returncode=0)
            ) as launch,
            redirect_stdout(io.StringIO()),
        ):
            self.assertEqual(product.main(), 0)
        self.assertEqual((self.root / "catalogue.json").read_bytes(), before)
        self.assertFalse(plist.exists())
        self.assertFalse(product.load(self.root / "state.json")["enabled"])
        self.assertTrue(
            all(
                "com.reading-list.recommendations" in argument
                for argument in launch.call_args.args[0]
                if argument.startswith("gui/")
            )
        )

    def test_url_allowlist_rejects_protocol_host_port_traversal(self):
        for url in [
            "http://www.fjlib.net/zy/xstj/a",
            "https://127.0.0.1/zy/xstj/a",
            "https://www.fjlib.net:444/zy/xstj/a",
            "https://www.fjlib.net/zy/xstj/%2e%2e/config",
            "https://user@www.fjlib.net/zy/xstj/a",
            "https://www.fjlib.net/other",
        ]:
            with self.subTest(url=url), self.assertRaises(product.Failure):
                product.safe_url(url, "fjlib")

    def test_private_dns_is_rejected_without_connection(self):
        with (
            patch.object(
                product.socket,
                "getaddrinfo",
                return_value=[(2, 1, 6, "", ("127.0.0.1", 443))],
            ),
            patch.object(product.socket, "create_connection") as connect,
            self.assertRaisesRegex(product.Failure, "policy"),
        ):
            product.Transport().fetch(product.SOURCES["fjlib"]["pages"][0], "fjlib")
        connect.assert_not_called()

    def test_plist_uses_hourly_tick_and_run_at_load(self):
        config = install_local_preview.recommendations_plist(Path(self.temp.name))
        self.assertEqual(config["StartInterval"], 3600)
        self.assertTrue(config["RunAtLoad"])
        self.assertIn("tick", config["ProgramArguments"])
        self.assertNotIn("KeepAlive", config)

    def test_schema_tampering_and_unsafe_origin_are_rejected(self):
        self.run_collection()
        value = product.load(self.root / "catalogue.json")
        value["records"][0]["summary"] = "changed"
        with self.assertRaises(product.Failure):
            product.validate_catalogue(value)
        value["records"][0]["origins"][0]["url"] = "javascript:alert(1)"
        value["revision"] = product.digest(
            {key: entry for key, entry in value.items() if key != "revision"}
        )
        with self.assertRaises(product.Failure):
            product.validate_catalogue(value)


class RouteTest(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        product.init(self.root / "recommendations")
        self.server = local_deploy.server(self.root, 0)
        thread = threading.Thread(target=self.server.serve_forever, daemon=True)
        thread.start()
        self.addCleanup(self.server.server_close)
        self.addCleanup(self.server.shutdown)
        self.url = f"http://127.0.0.1:{self.server.server_port}"

    def request(self, path, method="GET"):
        return urllib.request.urlopen(
            urllib.request.Request(self.url + path, method=method), timeout=5
        )

    def test_missing_then_absolute_readonly_route_without_app_release(self):
        with self.assertRaises(urllib.error.HTTPError) as raised:
            self.request("/__recommendations/catalogue.json")
        self.assertEqual(raised.exception.code, 503)
        raised.exception.close()
        product.collect(self.root / "recommendations", transport=FixtureTransport())
        with self.request("/__recommendations/catalogue.json") as response:
            self.assertEqual(response.status, 200)
            self.assertEqual(response.headers["Cache-Control"], "no-store")
            self.assertEqual(response.headers["X-Content-Type-Options"], "nosniff")
            product.validate_catalogue(json.load(response))
        with self.request("/__recommendations/catalogue.json", "HEAD") as response:
            self.assertEqual(response.read(), b"")
        for path, method, status in [
            ("/__recommendations/catalogue.json", "POST", 405),
            ("/__recommendations/config.json", "GET", 404),
            ("/__recommendations/reports/x", "GET", 404),
            ("/__recommendations/%2e%2e/config.json", "GET", 404),
        ]:
            with (
                self.subTest(path=path),
                self.assertRaises(urllib.error.HTTPError) as raised,
            ):
                self.request(path, method)
            self.assertEqual(raised.exception.code, status)
            raised.exception.close()


class TransportTest(unittest.TestCase):
    def fetch_responses(self, responses):
        calls = []

        class Connection:
            def __init__(self, host, timeout):
                self.host = host
                self.timeout = timeout

            def request(self, method, path, headers):
                calls.append(
                    {
                        "method": method,
                        "path": path,
                        "host": self.host,
                        "headers": headers,
                    }
                )

            def getresponse(self):
                response = responses.pop(0)
                if isinstance(response, Exception):
                    raise response
                return response

            def close(self):
                return None

        stack = ExitStack()
        self.addCleanup(stack.close)
        stack.enter_context(
            patch.object(product.http.client, "HTTPSConnection", Connection)
        )
        stack.enter_context(
            patch.object(
                product.socket,
                "getaddrinfo",
                return_value=[(2, 1, 6, "", ("93.184.216.34", 443))],
            )
        )
        stack.enter_context(
            patch.object(product.socket, "create_connection", return_value=object())
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
        stack.enter_context(patch.object(product.time, "sleep"))
        return product.Transport(), calls

    def response(self, status=200, body=b"<html>ok</html>", location=None):
        return SimpleNamespace(
            status=status,
            read=lambda limit: body[:limit],
            getheader=lambda name, default="": (
                location
                if name == "Location"
                else "text/html; charset=utf-8"
                if name == "Content-Type"
                else default
            ),
        )

    def test_policy_status_stops_without_retry(self):
        for status in (403, 429):
            with self.subTest(status=status):
                transport, calls = self.fetch_responses([self.response(status)])
                with self.assertRaisesRegex(product.Failure, "policy"):
                    transport.fetch(product.SOURCES["writer"]["pages"][0], "writer")
                self.assertEqual(len(calls), 1)

    def test_timeout_and_server_failure_retry_only_once(self):
        for first in (TimeoutError("timeout"), self.response(503)):
            with self.subTest(first=first):
                transport, calls = self.fetch_responses([first, self.response()])
                self.assertEqual(
                    transport.fetch(product.SOURCES["writer"]["pages"][0], "writer"),
                    "<html>ok</html>",
                )
                self.assertEqual(len(calls), 2)

    def test_external_redirect_rejected_before_connection(self):
        transport, calls = self.fetch_responses(
            [self.response(302, location="https://evil.invalid/x")]
        )
        with self.assertRaisesRegex(product.Failure, "policy"):
            transport.fetch(product.SOURCES["writer"]["pages"][0], "writer")
        self.assertEqual(len(calls), 1)

    def test_oversized_body_rejected(self):
        transport, calls = self.fetch_responses(
            [self.response(body=b"x" * (2 * 1024 * 1024 + 1))]
        )
        with self.assertRaisesRegex(product.Failure, "size_limit"):
            transport.fetch(product.SOURCES["writer"]["pages"][0], "writer")
        self.assertEqual(len(calls), 1)

    def test_page_budget_deadline_and_redirect_budget_do_not_request(self):
        transport, calls = self.fetch_responses([])
        transport.counts["writer"] = 50
        with self.assertRaisesRegex(product.Failure, "size_limit"):
            transport.fetch(product.SOURCES["writer"]["pages"][0], "writer")
        transport.counts.clear()
        with self.assertRaisesRegex(product.Failure, "size_limit"):
            transport.fetch(
                product.SOURCES["writer"]["pages"][0], "writer", redirects=5
            )
        transport.deadline = 0
        with self.assertRaisesRegex(product.Failure, "size_limit"):
            transport.fetch(product.SOURCES["writer"]["pages"][0], "writer")
        self.assertEqual(calls, [])

    def test_requests_are_fixed_public_get_without_private_fields(self):
        transport, calls = self.fetch_responses([self.response()])
        transport.fetch(product.SOURCES["fjlib"]["pages"][0], "fjlib")
        self.assertEqual(calls[0]["method"], "GET")
        self.assertNotIn("?", calls[0]["path"])
        self.assertEqual(
            set(calls[0]["headers"]), {"User-Agent", "Accept", "Accept-Encoding"}
        )
        self.assertEqual(calls[0]["headers"]["Accept-Encoding"], "identity")


class TransportBoundaryTest(unittest.TestCase):
    def harness(self, delays=None, statuses=None, controlled=True, blocked=None):
        clock = {"now": 100.0}
        events = []
        delays = {key: list(values) for key, values in (delays or {}).items()}
        statuses = list(statuses or [200, 200, 200])

        def phase(name, **details):
            events.append({"phase": name, "time": clock["now"], **details})
            if blocked and name == blocked[0]:
                blocked[1].wait(2)
            if delays.get(name):
                clock["now"] += delays[name].pop(0)

        def sleep(duration):
            phase("sleep", duration=duration)
            clock["now"] += duration

        def resolve(*args, **kwargs):
            phase("dns")
            return [(2, 1, 6, "", ("93.184.216.34", 443))]

        def connect(address, timeout):
            phase("connect", timeout=timeout)
            return SimpleNamespace(close=lambda: phase("socket_close"))

        def wrap(raw_socket, server_hostname):
            phase("tls")
            return raw_socket

        class Connection:
            def __init__(self, hostname, timeout):
                self.timeout = timeout

            def request(self, method, path, headers):
                phase("request", path=path)

            def getresponse(self):
                phase("headers")
                status = statuses.pop(0)

                def read(limit):
                    phase("read")
                    return b"<html>ok</html>"

                return SimpleNamespace(
                    status=status,
                    read=read,
                    close=lambda: phase("response_close"),
                    getheader=lambda name, default="": (
                        product.SOURCES["writer"]["pages"][0]
                        if name == "Location"
                        else "text/html; charset=utf-8"
                    ),
                )

            def close(self):
                phase("close")

        stack = ExitStack()
        self.addCleanup(stack.close)
        if controlled:
            stack.enter_context(
                patch.object(product.time, "monotonic", lambda: clock["now"])
            )
            stack.enter_context(
                patch.object(product.time, "time", lambda: clock["now"])
            )
            stack.enter_context(patch.object(product.time, "sleep", sleep))
        stack.enter_context(patch.object(product.socket, "getaddrinfo", resolve))
        stack.enter_context(patch.object(product.socket, "create_connection", connect))
        stack.enter_context(
            patch.object(product.http.client, "HTTPSConnection", Connection)
        )
        stack.enter_context(
            patch.object(
                product.ssl,
                "create_default_context",
                return_value=SimpleNamespace(wrap_socket=wrap),
            )
        )
        return product.Transport(), clock, events

    def fetch(self, transport):
        return transport.fetch(product.SOURCES["writer"]["pages"][0], "writer")

    def test_slow_dns_and_tls_limit_actual_dispatch_starts(self):
        for stage in ("dns", "tls"):
            with self.subTest(stage=stage):
                transport, unused_clock, events = self.harness({stage: [2]})
                self.fetch(transport)
                self.fetch(transport)
                starts = [
                    event["time"] for event in events if event["phase"] == "request"
                ]
                self.assertGreaterEqual(starts[1] - starts[0], 1)

    def test_retry_and_redirect_keep_dispatch_spacing(self):
        for status in (503, 302):
            with self.subTest(status=status):
                transport, unused_clock, events = self.harness(
                    {"dns": [2]}, [status, 200]
                )
                self.fetch(transport)
                starts = [
                    event["time"] for event in events if event["phase"] == "request"
                ]
                self.assertEqual(len(starts), 2)
                self.assertGreaterEqual(starts[1] - starts[0], 1)

    def test_deadline_after_each_preparation_stops_next_io(self):
        for stage, forbidden in (
            ("dns", "connect"),
            ("connect", "tls"),
            ("tls", "request"),
            ("request", "headers"),
            ("headers", "read"),
        ):
            with self.subTest(stage=stage):
                transport, unused_clock, events = self.harness({stage: [301]})
                with self.assertRaisesRegex(product.Failure, "size_limit"):
                    self.fetch(transport)
                self.assertFalse(any(event["phase"] == forbidden for event in events))

    def test_deadline_crossed_in_wait_never_sends(self):
        transport, clock, events = self.harness()
        self.fetch(transport)
        transport.deadline = clock["now"] + 0.5
        with self.assertRaisesRegex(product.Failure, "size_limit"):
            self.fetch(transport)
        self.assertEqual(sum(event["phase"] == "request" for event in events), 1)
        self.assertLessEqual(clock["now"], transport.deadline)

    def test_read_crossing_deadline_fails_without_retry(self):
        transport, unused_clock, events = self.harness({"read": [301]})
        with self.assertRaisesRegex(product.Failure, "size_limit"):
            self.fetch(transport)
        self.assertEqual(sum(event["phase"] == "request" for event in events), 1)

    def test_subsecond_remaining_is_not_floored_to_one(self):
        transport, clock, events = self.harness()
        transport.deadline = clock["now"] + 0.25
        self.fetch(transport)
        timeout = next(
            event["timeout"] for event in events if event["phase"] == "connect"
        )
        self.assertLessEqual(timeout, 0.25)

    def test_report_separates_dispatch_from_response_completion(self):
        transport, unused_clock, unused_events = self.harness({"read": [2]})
        self.fetch(transport)
        report = transport.requests[0]
        self.assertEqual(report["requestedAt"], product.stamp(100))
        self.assertEqual(report["completedAt"], product.stamp(102))

    def test_stalled_dns_and_read_are_bounded_by_wall_deadline(self):
        for stage in ("dns", "tls", "read"):
            with self.subTest(stage=stage):
                released = threading.Event()
                finished = threading.Event()
                transport, unused_clock, events = self.harness(
                    controlled=False, blocked=(stage, released)
                )
                transport.deadline = product.time.monotonic() + 0.05
                failures = []

                def run():
                    try:
                        self.fetch(transport)
                    except product.Failure as error:
                        failures.append(error.code)
                    finally:
                        finished.set()

                worker = threading.Thread(target=run)
                worker.start()
                try:
                    self.assertTrue(
                        finished.wait(0.5), "Blocked I/O outlived the round budget"
                    )
                    self.assertEqual(failures, ["size_limit"])
                    if stage == "dns":
                        self.assertFalse(
                            any(event["phase"] == "connect" for event in events)
                        )
                finally:
                    released.set()
                    worker.join(1)

    def test_timeout_interrupts_underlying_socket_during_tls_and_read(self):
        for stage in ("tls", "read"):
            with self.subTest(stage=stage):
                released = threading.Event()
                transport, unused_clock, unused_events = self.harness(
                    controlled=False, blocked=(stage, released)
                )
                receiver, peer = product.socket.socketpair()
                peer.settimeout(0.5)
                transport.deadline = product.time.monotonic() + 0.05
                try:
                    with patch.object(
                        product.socket, "create_connection", return_value=receiver
                    ):
                        with self.assertRaisesRegex(product.Failure, "size_limit"):
                            self.fetch(transport)
                    self.assertEqual(
                        peer.recv(1), b"", "Expired I/O socket was not interrupted"
                    )
                finally:
                    released.set()
                    receiver.close()
                    peer.close()


if __name__ == "__main__":
    unittest.main()

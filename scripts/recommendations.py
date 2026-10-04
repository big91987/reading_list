#!/usr/bin/env python3
"""Owner-operated public recommendations; never reads a private reading list."""

import argparse
import copy
import fcntl
import hashlib
import http.client
import ipaddress
import json
import os
import re
import socket
import ssl
import threading
import time
import unicodedata
import urllib.parse
import urllib.robotparser
from contextlib import contextmanager
from datetime import datetime, timezone
from html.parser import HTMLParser
from pathlib import Path

TYPES = {"古典文学", "仙侠", "现当代文学", "历史社科", "科普", "其他"}
USER_AGENT = "ReadingList-Recommendations/1.0"
WEEK = 7 * 86400
SOURCES = {
    "writer": {
        "organisation": "中国作家网",
        "host": "www.chinawriter.com.cn",
        "prefix": "/n1/",
        "pages": ["https://www.chinawriter.com.cn/n1/2026/0902/c459748-40791254.html"],
    },
    "fjlib": {
        "organisation": "福建省图书馆",
        "host": "www.fjlib.net",
        "prefix": "/zy/xstj/",
        "pages": [
            "https://www.fjlib.net/zy/xstj/202609/t20260917_481274.htm",
            "https://www.fjlib.net/zy/xstj/202609/t20260917_481272.htm",
        ],
    },
}
ERROR_CODES = {
    "network",
    "parse",
    "policy",
    "size_limit",
    "schema",
    "coverage_insufficient",
    "disabled",
}
CONTENT_TOPICS = (
    "屯堡",
    "科举",
    "军屯",
    "知识分子",
    "宿舍",
    "都市",
    "北京",
    "家庭",
    "职场",
    "女性",
    "爵士乐",
    "爱情",
    "西贡",
    "童年",
    "家族",
    "婚姻",
    "绑架",
    "藏区",
    "自然",
    "亲情",
    "医院",
    "疾病",
    "返乡",
    "乡村",
    "城市",
    "成长",
    "死亡",
    "情感",
    "战争",
    "历史",
    "文学",
    "人生",
    "诗歌",
    "艺术",
    "乡愁",
    "故乡",
    "记忆",
    "上海",
    "越剧",
    "科学",
    "科幻",
    "神话",
    "宇宙",
    "器官",
    "眼睛",
    "空间",
    "房间",
    "缅甸",
    "德国",
    "纳粹",
    "集中营",
    "自由",
    "精神",
    "友谊",
    "生活",
    "生命",
)


def factual_writer_summary(raw):
    evidence = raw["evidence"]
    topics = sorted(
        (topic for topic in CONTENT_TOPICS if topic in evidence), key=evidence.index
    )[:3]
    if not topics:
        raise Failure("parse")
    return f"这是一部{raw['genre']}作品；来源介绍提及{'、'.join(topics)}，可据这些内容线索了解本书。"


class Failure(ValueError):
    def __init__(self, code):
        self.code = code
        super().__init__(code)


def stamp(value):
    return (
        datetime.fromtimestamp(value, timezone.utc).isoformat().replace("+00:00", "Z")
    )


def canonical(value):
    return json.dumps(
        value, ensure_ascii=False, sort_keys=True, separators=(",", ":")
    ).encode()


def digest(value):
    return hashlib.sha256(canonical(value)).hexdigest()


def save(path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = path.with_name(path.name + ".tmp")
    try:
        with temporary.open("wb") as output:
            output.write(canonical(value))
            output.flush()
            os.fsync(output.fileno())
        os.replace(temporary, path)
        directory = os.open(path.parent, os.O_RDONLY)
        try:
            os.fsync(directory)
        finally:
            os.close(directory)
    finally:
        temporary.unlink(missing_ok=True)


def load(path, default=None):
    try:
        return json.loads(path.read_bytes())
    except FileNotFoundError:
        return copy.deepcopy(default)
    except (ValueError, OSError) as error:
        raise Failure("schema") from error


@contextmanager
def locked(root):
    root.mkdir(parents=True, exist_ok=True)
    with (root / "process.lock").open("a") as lock:
        try:
            fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
        except BlockingIOError as error:
            raise Failure("busy") from error
        yield


def safe_url(url, source_id, robots=False):
    parsed = urllib.parse.urlsplit(url)
    source = SOURCES[source_id]
    try:
        valid = (
            parsed.scheme == "https"
            and parsed.hostname == source["host"]
            and parsed.port in (None, 443)
            and not parsed.username
            and not parsed.password
            and not parsed.query
            and not parsed.fragment
            and (
                parsed.path == "/robots.txt"
                if robots
                else parsed.path.startswith(source["prefix"])
            )
            and not any(
                part in (".", "..")
                for part in urllib.parse.unquote(parsed.path).split("/")
            )
        )
    except ValueError:
        valid = False
    if not valid:
        raise Failure("policy")
    return parsed


class Transport:
    def __init__(self):
        self.deadline = time.monotonic() + 300
        self.previous = None
        self.requests = []
        self.counts = {}

    def remaining(self):
        remaining = self.deadline - time.monotonic()
        if remaining <= 0:
            raise Failure("size_limit")
        return remaining

    def bounded(self, operation, cleanup=None, abort=None):
        self.remaining()
        completed = threading.Event()
        guard = threading.Lock()
        state = {}

        def discard(result):
            if result and result[0] and cleanup:
                try:
                    cleanup(result[1])
                except OSError:
                    pass

        def worker():
            try:
                self.remaining()
                result = (True, operation())
            except Exception as error:
                result = (False, error)
            with guard:
                if state.get("abandoned"):
                    discard(result)
                else:
                    state["result"] = result
                    completed.set()

        timeout = min(20, self.remaining())
        threading.Thread(target=worker, daemon=True).start()
        ready = completed.wait(timeout)
        with guard:
            result = state.pop("result", None)
            state["abandoned"] = True
        try:
            self.remaining()
            if not ready:
                raise TimeoutError("Public request operation timed out")
            if not result[0]:
                raise result[1]
            return result[1]
        except Exception:
            if abort:
                abort()
            discard(result)
            raise

    def fetch(self, url, source_id, robots=False, redirects=0, retry=False):
        parsed = safe_url(url, source_id, robots)
        if redirects > 4 or time.monotonic() >= self.deadline:
            raise Failure("size_limit")
        self.counts[source_id] = self.counts.get(source_id, 0) + 1
        if self.counts[source_id] > 50:
            raise Failure("size_limit")
        try:
            addresses = self.bounded(
                lambda: socket.getaddrinfo(
                    parsed.hostname, 443, type=socket.SOCK_STREAM
                )
            )
        except OSError as error:
            if not retry:
                return self.fetch(url, source_id, robots, redirects, True)
            raise Failure("network") from error
        if not addresses or any(
            not ipaddress.ip_address(entry[4][0]).is_global for entry in addresses
        ):
            raise Failure("policy")
        connection = http.client.HTTPSConnection(
            parsed.hostname, timeout=min(20, self.remaining())
        )
        interrupt_socket = None

        def abort():
            if interrupt_socket is not None:
                try:
                    interrupt_socket.shutdown(socket.SHUT_RDWR)
                except OSError:
                    pass

        try:
            raw_socket = self.bounded(
                lambda: socket.create_connection(
                    addresses[0][4][:2], min(20, self.remaining())
                ),
                cleanup=lambda value: value.close(),
            )
            connection.sock = raw_socket
            if isinstance(raw_socket, socket.socket):
                interrupt_socket = raw_socket.dup()
            secure_socket = self.bounded(
                lambda: ssl.create_default_context().wrap_socket(
                    raw_socket, server_hostname=parsed.hostname
                ),
                cleanup=lambda value: value.close(),
                abort=abort,
            )
            connection.sock = secure_socket
            delay = (
                max(0, 1 - (time.monotonic() - self.previous))
                if self.previous is not None
                else 0
            )
            if delay:
                time.sleep(min(delay, self.remaining()))
            self.remaining()
            sent = {}

            def dispatch():
                self.remaining()
                self.previous = time.monotonic()
                sent["requestedAt"] = stamp(time.time())
                sent["startedMonotonic"] = self.previous
                connection.request(
                    "GET",
                    parsed.path,
                    headers={
                        "User-Agent": USER_AGENT,
                        "Accept": "text/html,text/plain",
                        "Accept-Encoding": "identity",
                    },
                )

            self.bounded(dispatch, abort=abort)
            response = self.bounded(connection.getresponse, abort=abort)
            body = self.bounded(lambda: response.read(2 * 1024 * 1024 + 1), abort=abort)
            self.requests.append(
                {
                    "url": url,
                    **sent,
                    "completedAt": stamp(time.time()),
                    "durationSeconds": time.monotonic() - sent["startedMonotonic"],
                    "status": response.status,
                    "bytes": len(body),
                    "sha256": hashlib.sha256(body).hexdigest(),
                }
            )
            if len(body) > 2 * 1024 * 1024:
                raise Failure("size_limit")
            if response.status in (403, 429):
                raise Failure("policy")
            if response.status in (301, 302, 303, 307, 308):
                target = urllib.parse.urljoin(url, response.getheader("Location", ""))
                return self.fetch(target, source_id, robots, redirects + 1)
            if response.status == 404 and robots:
                return None
            if response.status >= 500 and not retry:
                return self.fetch(url, source_id, robots, redirects, True)
            if response.status != 200:
                raise Failure("network")
            content_type = response.getheader("Content-Type", "")
            if not any(kind in content_type for kind in ("text/html", "text/plain")):
                raise Failure("schema")
            encoding = re.search(r"charset=([\w-]+)", content_type)
            return body.decode(encoding.group(1) if encoding else "utf-8")
        except (OSError, http.client.HTTPException) as error:
            if not retry:
                return self.fetch(url, source_id, robots, redirects, True)
            raise Failure("network") from error
        except (UnicodeError, LookupError) as error:
            raise Failure("parse") from error
        finally:
            if interrupt_socket is not None:
                interrupt_socket.close()
            connection.close()


class Element:
    def __init__(self, tag, attrs):
        self.tag, self.attrs, self.children = tag, dict(attrs), []

    def text(self):
        if self.tag in ("script", "style"):
            return ""
        return "".join(
            child.text() if isinstance(child, Element) else child
            for child in self.children
        )

    def find(self, tag=None, class_name=None):
        for child in self.children:
            if isinstance(child, Element):
                if (tag is None or child.tag == tag) and (
                    class_name is None
                    or class_name in child.attrs.get("class", "").split()
                ):
                    yield child
                yield from child.find(tag, class_name)


class Document(HTMLParser):
    def __init__(self, html):
        super().__init__(convert_charrefs=True)
        self.root = Element("root", [])
        self.stack = [self.root]
        self.feed(html)

    def handle_starttag(self, tag, attrs):
        element = Element(tag, attrs)
        self.stack[-1].children.append(element)
        if tag not in {
            "img",
            "meta",
            "link",
            "br",
            "hr",
            "input",
            "source",
            "area",
            "embed",
            "wbr",
        }:
            self.stack.append(element)

    def handle_endtag(self, tag):
        for index in range(len(self.stack) - 1, 0, -1):
            if self.stack[index].tag == tag:
                del self.stack[index:]
                break

    def handle_data(self, data):
        self.stack[-1].children.append(data)


def clean(text):
    return re.sub(r"\s+", " ", text).strip()


def parse(html, source_id, url):
    container_class = "end_article" if source_id == "writer" else "TRS_Editor"
    containers = list(Document(html).root.find(class_name=container_class))
    if len(containers) != 1:
        raise Failure("parse")
    if source_id == "writer":
        if not all(term in Document(html).root.text() for term in ("文学好书", "入围")):
            raise Failure("parse")
        records, current, genre = [], None, ""
        genres = {
            "长篇小说",
            "中短篇小说",
            "散文",
            "散文/随笔",
            "诗歌",
            "理论评论",
            "科幻",
            "非虚构",
            "非虚构/纪实",
            "儿童文学",
        }
        for paragraph in containers[0].find("p"):
            text = clean(paragraph.text())
            if text in genres:
                genre = text
            title = re.fullmatch(r"《(.+)》", text)
            if title:
                current = {
                    "title": title.group(1),
                    "author": "",
                    "publisher": None,
                    "genre": genre,
                    "evidence": "",
                    "types": ["现当代文学"],
                }
                records.append(current)
            if current and text.startswith("作者"):
                current["author"] = re.sub(r"^作者\s*[:：]\s*", "", text)
            if current and text.startswith("推荐语："):
                current["evidence"] = text.removeprefix("推荐语：").strip()
        if not records or any(
            not record["genre"] or not record["author"] or not record["evidence"]
            for record in records
        ):
            raise Failure("parse")
        for record in records:
            record["summary"] = factual_writer_summary(record)
        return records
    body = clean(containers[0].text())
    fields = {}
    for label in ("题名", "作者", "出版社", "索书号", "内容简介"):
        match = re.search(
            re.escape(label)
            + r"：(.*?)(?=题名：|作者：|出版社：|索书号：|内容简介：|点这里查馆藏|$)",
            body,
        )
        fields[label] = match.group(1).strip() if match else ""
    if not all(fields[label] for label in ("题名", "作者", "索书号", "内容简介")):
        raise Failure("parse")
    genre = fields["索书号"]
    kind = (
        "科普"
        if genre.startswith("B84-49")
        else "历史社科"
        if genre.startswith(("K", "F", "D", "C"))
        else "现当代文学"
        if genre.startswith("I")
        else "其他"
    )
    evidence = fields["内容简介"]
    if "梅西" in fields["题名"] and all(word in evidence for word in ("梅西", "足球")):
        summary = "介绍梅西个人经历与足球生涯的传记。"
    elif genre.startswith("B84-49") and all(
        word in evidence for word in ("人格", "案例", "客体关系")
    ):
        summary = "借助精神分析客体关系理论与案例，介绍不同人格特质和咨询中的理解方式。"
    else:
        raise Failure("parse")
    return [
        {
            "title": fields["题名"],
            "author": fields["作者"],
            "publisher": fields["出版社"] or None,
            "genre": genre,
            "types": [kind],
            "evidence": evidence,
            "summary": summary,
        }
    ]


def record(raw, source_id, url, collected):
    identity = [
        unicodedata.normalize("NFC", (raw.get(field) or "").strip()).lower()
        for field in ("title", "author", "publisher", "edition")
    ]
    if not raw.get("author") or not raw.get("publisher"):
        identity.extend([source_id, url])
    return {
        "id": digest(identity),
        "title": raw["title"],
        "author": raw["author"],
        "publisher": raw.get("publisher"),
        "edition": raw.get("edition"),
        "types": raw["types"],
        "summary": raw["summary"],
        "summaryOrigin": {
            "method": "factual-template-v1",
            "evidenceSourceId": source_id,
        },
        "origins": [
            {
                "sourceId": source_id,
                "organisation": SOURCES[source_id]["organisation"],
                "url": url,
                "recommendationStatus": "文学好书入围书单"
                if source_id == "writer"
                else "新书推荐栏目",
                "sourceType": raw["genre"],
                "typeOrigin": "本产品映射",
                "publishedAt": None,
                "collectedAt": collected,
            }
        ],
    }


def valid_date(value):
    if not isinstance(value, str) or not re.fullmatch(
        r"\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,6})?Z", value
    ):
        raise Failure("schema")
    try:
        datetime.fromisoformat(value.replace("Z", "+00:00"))
    except ValueError as error:
        raise Failure("schema") from error


def validate_catalogue(value):
    try:
        if (
            value["schemaVersion"] != 1
            or value["status"] not in {"ok", "partial", "failed"}
            or len(value["records"]) > 1000
            or len(canonical(value)) > 1024 * 1024
        ):
            raise Failure("schema")
        valid_date(value["generatedAt"])
        if value["revision"] != digest(
            {key: item for key, item in value.items() if key != "revision"}
        ):
            raise Failure("schema")
        identities = set()
        for entry in value["records"]:
            if entry["id"] in identities or not re.fullmatch(
                r"[0-9a-f]{64}", entry["id"]
            ):
                raise Failure("schema")
            identities.add(entry["id"])
            for field, maximum in (("title", 80), ("author", 120), ("summary", 300)):
                if (
                    not isinstance(entry[field], str)
                    or not 1 <= len(entry[field]) <= maximum
                ):
                    raise Failure("schema")
            for field in ("publisher", "edition"):
                if entry[field] is not None and (
                    not isinstance(entry[field], str) or len(entry[field]) > 120
                ):
                    raise Failure("schema")
            if (
                not 1 <= len(entry["types"]) <= 3
                or len(set(entry["types"])) != len(entry["types"])
                or not set(entry["types"]) <= TYPES
                or not entry["origins"]
            ):
                raise Failure("schema")
            if entry["summaryOrigin"]["method"] != "factual-template-v1":
                raise Failure("schema")
            for origin in entry["origins"]:
                if (
                    len(origin["url"]) > 2048
                    or origin["organisation"]
                    != SOURCES[origin["sourceId"]]["organisation"]
                ):
                    raise Failure("schema")
                safe_url(origin["url"], origin["sourceId"])
                valid_date(origin["collectedAt"])
                if origin["publishedAt"] is not None:
                    valid_date(origin["publishedAt"])
        for source in value["sources"]:
            if (
                source["id"] not in SOURCES
                or source["status"] not in {"ok", "failed", "paused"}
                or source["errorCode"] not in ERROR_CODES | {None}
            ):
                raise Failure("schema")
            for field in ("lastSuccessAt", "lastAttemptAt"):
                if source[field] is not None:
                    valid_date(source[field])
    except (KeyError, TypeError, ValueError) as error:
        raise Failure("schema") from error
    return value


def init(root):
    with locked(root):
        if not (root / "config.json").exists():
            save(
                root / "config.json",
                {
                    "schemaVersion": 1,
                    "sources": {
                        source_id: {
                            "enabled": True,
                            "removed": False,
                            "pages": source["pages"],
                        }
                        for source_id, source in SOURCES.items()
                    },
                },
            )
        if not (root / "state.json").exists():
            save(root / "state.json", {"enabled": False, "nextAttempt": 0})


def validate_config(root):
    config = load(root / "config.json")
    if (
        not isinstance(config, dict)
        or config.get("schemaVersion") != 1
        or set(config.get("sources", {})) != set(SOURCES)
    ):
        raise Failure("schema")
    for source_id, source in config["sources"].items():
        if (
            not isinstance(source.get("enabled"), bool)
            or not isinstance(source.get("removed"), bool)
            or not isinstance(source.get("pages"), list)
            or not 1 <= len(source["pages"]) <= 49
        ):
            raise Failure("schema")
        for url in source["pages"]:
            safe_url(url, source_id)
    existing = load(root / "catalogue.json")
    if existing is not None:
        validate_catalogue(existing)
    return config


def collect(root, trigger="manual", clock=time.time, transport=None):
    with locked(root):
        config = validate_config(root)
        state = load(root / "state.json", {"enabled": False, "nextAttempt": 0})
        previous = load(root / "catalogue.json")
        if previous:
            published_time = datetime.fromisoformat(
                previous["generatedAt"].replace("Z", "+00:00")
            ).timestamp()
            if state.get("lastAttempt", 0) < published_time - 0.000001:
                state["lastAttempt"] = published_time
                state["nextAttempt"] = published_time + (
                    WEEK if previous["status"] == "ok" else 3600
                )
                save(root / "state.json", state)
        started = clock()
        if trigger == "tick" and (
            not state["enabled"] or state.get("nextAttempt", 0) > started
        ):
            return {
                "result": "disabled" if not state["enabled"] else "not_due",
                "exitCode": 0,
            }
        transport = transport or Transport()
        collected, sources, evidence, failures = [], [], [], 0
        for source_id in SOURCES:
            source = config["sources"][source_id]
            cached = load(
                root / "source-cache" / (source_id + ".json"),
                {"records": [], "lastSuccessAt": None},
            )
            if source["removed"]:
                cached = {"records": [], "lastSuccessAt": None}
            source_state = {
                "id": source_id,
                "organisation": SOURCES[source_id]["organisation"],
                "status": "paused",
                "lastSuccessAt": cached["lastSuccessAt"],
                "lastAttemptAt": None,
                "errorCode": "disabled",
            }
            if source["enabled"] and not source["removed"]:
                source_state["lastAttemptAt"] = stamp(started)
                try:
                    robots_url = f"https://{SOURCES[source_id]['host']}/robots.txt"
                    robots = transport.fetch(robots_url, source_id, robots=True)
                    policy = urllib.robotparser.RobotFileParser()
                    if robots is not None:
                        policy.parse(robots.splitlines())
                    fresh = []
                    for url in source["pages"]:
                        if robots is not None and not policy.can_fetch(USER_AGENT, url):
                            raise Failure("policy")
                        html = transport.fetch(url, source_id)
                        for raw in parse(html, source_id, url):
                            fresh.append(record(raw, source_id, url, stamp(started)))
                            evidence.append(
                                {
                                    "sourceId": source_id,
                                    "url": url,
                                    "title": raw["title"],
                                    "evidenceSha256": hashlib.sha256(
                                        raw["evidence"].encode()
                                    ).hexdigest(),
                                    "method": "factual-template-v1",
                                }
                            )
                    if len(fresh) > 500:
                        raise Failure("size_limit")
                    envelope = {
                        "schemaVersion": 1,
                        "generatedAt": stamp(started),
                        "status": "ok",
                        "sources": [],
                        "records": fresh,
                    }
                    envelope["revision"] = digest(envelope)
                    validate_catalogue(envelope)
                    cached = {"records": fresh, "lastSuccessAt": stamp(started)}
                    save(root / "source-cache" / (source_id + ".json"), cached)
                    source_state.update(
                        status="ok", lastSuccessAt=stamp(started), errorCode=None
                    )
                except Failure as error:
                    failures += 1
                    source_state.update(status="failed", errorCode=error.code)
                    if error.code == "policy":
                        source["enabled"] = False
                        save(root / "config.json", config)
            sources.append(source_state)
            collected.extend(cached["records"])
        merged = merge_records(collected)
        finished = clock()
        status = (
            "ok"
            if failures == 0
            else "failed"
            if all(source["status"] != "ok" for source in sources)
            else "partial"
        )
        envelope = {
            "schemaVersion": 1,
            "generatedAt": stamp(finished),
            "status": status,
            "sources": sources,
            "records": merged,
        }
        envelope["coverage"] = (
            "ready"
            if len(
                {entry["organisation"] for entry in sources if entry["status"] == "ok"}
            )
            >= 2
            and len({kind for entry in envelope["records"] for kind in entry["types"]})
            >= 3
            else "coverage_insufficient"
        )
        envelope["revision"] = digest(envelope)
        validate_catalogue(envelope)
        if envelope["records"] or failures == 0 or previous:
            save(root / "catalogue.json", envelope)
        state.update(
            lastAttempt=finished, nextAttempt=finished + (3600 if failures else WEEK)
        )
        state["initialReady"] = (
            state.get("initialReady", False) or envelope["coverage"] == "ready"
        )
        save(root / "state.json", state)
        report = {
            "runId": stamp(started).replace(":", "-"),
            "trigger": trigger,
            "sources": sources,
            "count": len(merged),
            "duration": finished - started,
            "errorCode": next(
                (
                    source["errorCode"]
                    for source in sources
                    if source["status"] == "failed"
                ),
                None,
            ),
            "publishRevision": envelope["revision"]
            if (root / "catalogue.json").exists()
            else None,
            "nextAttempt": state["nextAttempt"],
            "requests": transport.requests,
            "summaryEvidence": evidence,
            "permissionGranted": False,
            "exitCode": 1 if failures else 0,
        }
        save(root / "reports" / (report["runId"] + ".json"), report)
        reports = sorted((root / "reports").glob("*.json"), reverse=True)
        latest_failure = next(
            (path for path in reports if load(path).get("exitCode")), None
        )
        for index, path in enumerate(reports):
            if path != latest_failure and (
                index >= 3 or path.stat().st_mtime < time.time() - 30 * 86400
            ):
                path.unlink()
        return report


def merge_records(records):
    merged = {}
    for entry in records:
        if entry["id"] not in merged:
            merged[entry["id"]] = copy.deepcopy(entry)
        else:
            origins = merged[entry["id"]]["origins"]
            for origin in entry["origins"]:
                if not any(
                    (old["sourceId"], old["url"]) == (origin["sourceId"], origin["url"])
                    for old in origins
                ):
                    origins.append(origin)
    return list(merged.values())


def configure(root, action, source_id=None):
    with locked(root):
        config = validate_config(root)
        state = load(root / "state.json")
        if source_id:
            source = config["sources"][source_id]
            if action == "remove":
                source.update(enabled=False, removed=True)
            elif action == "enable":
                if source["removed"]:
                    raise Failure("policy")
                source["enabled"] = True
            else:
                source["enabled"] = False
            save(root / "config.json", config)
            catalogue = load(root / "catalogue.json")
            if catalogue:
                if action == "remove":
                    remaining = []
                    for retained_id in SOURCES:
                        if not config["sources"][retained_id]["removed"]:
                            remaining.extend(
                                load(
                                    root / "source-cache" / (retained_id + ".json"),
                                    {"records": []},
                                )["records"]
                            )
                    catalogue["records"] = merge_records(remaining)
                catalogue["coverage"] = "coverage_insufficient"
                for source_state in catalogue["sources"]:
                    if source_state["id"] == source_id:
                        source_state.update(status="paused", errorCode="disabled")
                catalogue["revision"] = digest(
                    {
                        key: value
                        for key, value in catalogue.items()
                        if key != "revision"
                    }
                )
                validate_catalogue(catalogue)
                save(root / "catalogue.json", catalogue)
        else:
            if action == "enable":
                catalogue = load(root / "catalogue.json")
                if not catalogue or (
                    not state.get("initialReady")
                    and catalogue.get("coverage") != "ready"
                ):
                    raise Failure("coverage_insufficient")
            state["enabled"] = action == "enable"
        if source_id:
            state["nextAttempt"] = 0
        save(root / "state.json", state)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "command",
        choices=[
            "init",
            "validate",
            "run",
            "tick",
            "enable",
            "disable",
            "status",
            "source",
            "uninstall",
        ],
    )
    parser.add_argument(
        "source_action", nargs="?", choices=["list", "enable", "disable", "remove"]
    )
    parser.add_argument("--id", choices=list(SOURCES))
    parser.add_argument(
        "--root", type=Path, default=Path.home() / ".local/share/reading-list-preview"
    )
    args = parser.parse_args()
    root = args.root.expanduser().resolve() / "recommendations"
    try:
        if args.command == "init":
            init(root)
            result = {"result": "initialized", "scheduling": "disabled"}
        elif args.command in ("run", "tick"):
            result = collect(root, "manual" if args.command == "run" else "tick")
        elif args.command == "validate":
            validate_config(root)
            catalogue = load(root / "catalogue.json")
            coverage = (
                bool(catalogue)
                and len(
                    {
                        entry["organisation"]
                        for entry in catalogue["sources"]
                        if entry["status"] == "ok"
                    }
                )
                >= 2
                and len(
                    {kind for entry in catalogue["records"] for kind in entry["types"]}
                )
                >= 3
            )
            result = {"result": "valid", "ready": coverage, "permissionGranted": False}
        elif args.command == "status":
            result = {
                "state": load(root / "state.json"),
                "config": validate_config(root),
                "catalogue": load(root / "catalogue.json"),
            }
        elif args.command == "source":
            if args.source_action == "list":
                result = validate_config(root)["sources"]
            elif args.source_action and args.id:
                configure(root, args.source_action, args.id)
                result = {"result": args.source_action, "sourceId": args.id}
            else:
                parser.error("source modification requires action and --id")
        elif args.command == "uninstall":
            configure(root, "disable")
            import subprocess

            label = "com.reading-list.recommendations"
            plist = Path.home() / "Library/LaunchAgents" / (label + ".plist")
            subprocess.run(
                ["launchctl", "bootout", f"gui/{os.getuid()}/{label}"],
                capture_output=True,
                check=False,
            )
            plist.unlink(missing_ok=True)
            result = {"result": "uninstalled", "dataPreserved": True}
        else:
            configure(root, args.command)
            result = {"result": args.command}
        print(json.dumps(result, ensure_ascii=False))
        return result.get("exitCode", 0)
    except Failure as error:
        print(json.dumps({"errorCode": error.code}))
        return 3 if error.code == "busy" else 2 if error.code == "schema" else 1


if __name__ == "__main__":
    raise SystemExit(main())

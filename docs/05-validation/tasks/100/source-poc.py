import gzip
import hashlib
import json
import re
import time
from datetime import datetime, timezone
from html.parser import HTMLParser
from pathlib import Path
from urllib.error import HTTPError
from urllib.parse import urljoin, urlsplit
from urllib.request import HTTPRedirectHandler, Request, build_opener

ALLOWED_HOSTS = {"www.chinawriter.com.cn", "www.fjlib.net", "www.nlc.cn"}
USER_AGENT = "ReadingList-SourcePoC/1.0"


def validate_url(url):
    parsed = urlsplit(url)
    if parsed.scheme != "https" or parsed.hostname not in ALLOWED_HOSTS:
        raise ValueError("URL is outside the public source allowlist")
    if parsed.username or parsed.password or parsed.port not in (None, 443):
        raise ValueError("Unexpected credentials or port")


class SafeRedirect(HTTPRedirectHandler):
    def redirect_request(self, request, response, code, message, headers, new_url):
        validate_url(new_url)
        return super().redirect_request(
            request, response, code, message, headers, new_url
        )


class Element:
    def __init__(self, tag, attributes):
        self.tag = tag
        self.attributes = dict(attributes)
        self.children = []

    def text(self):
        if self.tag in {"script", "style"}:
            return ""
        return "".join(
            child.text() if isinstance(child, Element) else child
            for child in self.children
        )

    def find(self, tag=None, class_name=None):
        for child in self.children:
            if isinstance(child, Element):
                classes = child.attributes.get("class", "").split()
                if (tag is None or child.tag == tag) and (
                    class_name is None or class_name in classes
                ):
                    yield child
                yield from child.find(tag, class_name)


class Document(HTMLParser):
    def __init__(self, html):
        super().__init__(convert_charrefs=True)
        self.root = Element("root", [])
        self.stack = [self.root]
        self.feed(html)

    def handle_starttag(self, tag, attributes):
        element = Element(tag, attributes)
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


def parse_writer(html, url):
    containers = list(Document(html).root.find(class_name="end_article"))
    if len(containers) != 1:
        raise ValueError("Expected one writer article body")
    books = []
    genre = "未分类"
    current = None
    for paragraph in containers[0].find("p"):
        text = clean(paragraph.text())
        if text in {
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
        }:
            genre = text
        title = re.fullmatch(r"《(.+)》", text)
        if title:
            current = {
                "title": title.group(1),
                "author": "",
                "source": "中国作家网",
                "url": url,
                "source_type": genre,
                "types": ["现当代文学", genre] if genre != "未分类" else [genre],
                "type_origin": "来源文学门类及本产品上层映射",
                "recommendation_status": "文学好书入围书单",
                "intro_evidence": "",
            }
            books.append(current)
        if current and text.startswith("作者"):
            current["author"] = re.sub(r"^作者\s*[:：]\s*", "", text)
        if current and text.startswith("推荐语："):
            current["intro_evidence"] = text.removeprefix("推荐语：").strip()
    return [book for book in books if book["author"] and book["intro_evidence"]]


def library_type(call_number):
    if call_number.startswith("B84-49"):
        return "科普"
    if call_number.startswith(("K", "F", "D", "C")):
        return "历史社科"
    if call_number.startswith("I"):
        return "现当代文学"
    return "未分类"


def parse_library(html, url):
    containers = list(Document(html).root.find(class_name="TRS_Editor"))
    if len(containers) != 1:
        raise ValueError("Expected one library recommendation body")
    fields = {}
    body_text = clean(containers[0].text())
    for label in ["题名", "作者", "出版社", "索书号"]:
        match = re.search(
            re.escape(label)
            + r"：(.*?)(?=题名：|作者：|出版社：|索书号：|内容简介：|点这里查馆藏|$)",
            body_text,
        )
        if match:
            fields[label] = match.group(1).strip()
    if "内容简介：" in body_text:
        fields["内容简介"] = (
            body_text.split("内容简介：", 1)[1].split("点这里查馆藏", 1)[0].strip()
        )
    if not all(fields.get(label) for label in ["题名", "作者", "索书号", "内容简介"]):
        raise ValueError("Library record missing required metadata or intro")
    return {
        "title": fields["题名"],
        "author": fields["作者"],
        "publisher": fields.get("出版社", ""),
        "source": "福建省图书馆",
        "url": url,
        "call_number": fields["索书号"],
        "source_type": fields["索书号"],
        "types": [library_type(fields["索书号"])],
        "type_origin": "本产品依据索书号映射，非机构官方类型",
        "recommendation_status": "新书推荐栏目",
        "intro_evidence": fields["内容简介"],
    }


def main():
    output = Path(__file__).with_name("source-poc")
    output.mkdir(exist_ok=True)
    responses = []
    opener = build_opener(SafeRedirect())

    def fetch(url, purpose, optional=False):
        validate_url(url)
        request = Request(
            url, headers={"User-Agent": USER_AGENT, "Accept": "text/html,text/plain"}
        )
        requested_at = datetime.now(timezone.utc).isoformat()
        try:
            response = opener.open(request, timeout=25)
        except HTTPError as error:
            if not optional:
                raise
            response = error
        with response:
            raw = response.read(2 * 1024 * 1024 + 1)
            if len(raw) > 2 * 1024 * 1024:
                raise ValueError("Response exceeded PoC size limit")
            encoding = response.headers.get_content_charset() or "utf-8"
            html = raw.decode(encoding)
            final_url = response.geturl()
            validate_url(final_url)
            filename = f"response-{len(responses) + 1:02}.html.gz"
            (output / filename).write_bytes(gzip.compress(raw, mtime=0))
            responses.append(
                {
                    "requested_url": url,
                    "final_url": final_url,
                    "requested_at": requested_at,
                    "status": response.code,
                    "purpose": purpose,
                    "user_agent": USER_AGENT,
                    "content_type": response.headers.get("Content-Type"),
                    "last_modified": response.headers.get("Last-Modified"),
                    "bytes": len(raw),
                    "sha256": hashlib.sha256(raw).hexdigest(),
                    "encoding": encoding,
                    "snapshot": filename,
                    "snapshot_encoding": "gzip; sha256 and bytes refer to uncompressed response",
                }
            )
            (output / "manifest.json").write_text(
                json.dumps(responses, ensure_ascii=False, indent=2) + "\n"
            )
            time.sleep(1)
            return html

    for host in ["www.chinawriter.com.cn", "www.fjlib.net"]:
        fetch(
            f"https://{host}/robots.txt",
            "public crawl directives; absence is not permission",
            optional=True,
        )
        if responses[-1]["status"] not in (404, 410):
            raise ValueError(
                "Robots response requires review before fetching source content"
            )

    writer_index = "https://www.chinawriter.com.cn/404087/404988/459746/index.html"
    writer_url = "https://www.chinawriter.com.cn/n1/2026/0902/c459748-40791254.html"
    index_html = fetch(
        writer_index, "institution recommendation programme and source discovery"
    )
    if "文学好书" not in index_html or urlsplit(writer_url).path not in index_html:
        raise ValueError("Writer programme does not link selected recommendation page")
    writer_html = fetch(
        writer_url, "official finalist recommendations with text intros"
    )
    if "入围" not in writer_html or "推荐语" not in writer_html:
        raise ValueError("Expected finalist recommendation semantics")
    books = parse_writer(writer_html, writer_url)
    if len(books) != 30:
        raise ValueError(f"Expected 30 text-based finalist records, found {len(books)}")

    library_home = "https://www.fjlib.net/"
    home_html = fetch(
        library_home, "institution homepage identifies new-book recommendations"
    )
    if "新书推荐" not in home_html:
        raise ValueError("Library homepage missing recommendation section")
    library_links = list(
        dict.fromkeys(
            urljoin(library_home, href)
            for href in re.findall(r'href="([^"]*zy/xstj/[^"]+)"', home_html)
        )
    )
    if len(library_links) < 4:
        raise ValueError("Library homepage missing four concrete recommendation links")
    for url in library_links[:4]:
        books.append(
            parse_library(
                fetch(
                    url, "new-book recommendation title author classification and intro"
                ),
                url,
            )
        )
    fetch("https://www.fjlib.net/flsm/", "library legal notice; not a licence grant")
    fetch(
        "https://www.nlc.cn/web/dsb_footer/bqsm/index.shtml",
        "restricted candidate policy; excluded from default automatic source set",
    )

    source_counts = {
        source: sum(book["source"] == source for book in books)
        for source in sorted({book["source"] for book in books})
    }
    types = sorted({book["types"][0] for book in books})
    if len(source_counts) != 2 or len(types) < 3 or "未分类" in types:
        raise ValueError(
            "PoC did not establish two organisations and three nonempty product types"
        )
    catalogue = {
        "scope": "research-only extracted evidence; not a published product catalogue",
        "permission_granted": False,
        "records": books,
    }
    report = {
        "completed_at": datetime.now(timezone.utc).isoformat(),
        "content_acquisition_and_parsing": "passed",
        "record_count": len(books),
        "source_counts": source_counts,
        "nonempty_product_types": types,
        "source_genres": sorted(
            {book["source_type"] for book in books if book["source"] == "中国作家网"}
        ),
        "all_records_have_title_author_intro_source_url": all(
            all(
                book[field]
                for field in ["title", "author", "intro_evidence", "source", "url"]
            )
            for book in books
        ),
        "request_count": len(responses),
        "private_booklist_used_or_sent": False,
        "product_acceptance_passed": False,
        "scheduled_runtime_tested": False,
        "distribution_or_production_deployment_tested": False,
        "policy_scope": "No blanket crawl/republication permission inferred. Original short factual summaries and links only in future product; no full source review or cover republication. NLC excluded pending permission.",
    }
    for filename, data in [
        ("manifest.json", responses),
        ("catalogue.json", catalogue),
        ("report.json", report),
    ]:
        (output / filename).write_text(
            json.dumps(data, ensure_ascii=False, indent=2) + "\n"
        )
    print(json.dumps(report, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()

import importlib.util
import unittest
from pathlib import Path


class SourceParserTests(unittest.TestCase):
    def setUp(self):
        path = Path(__file__).with_name("source-poc.py")
        self.assertTrue(path.exists(), "Task source parser is not implemented")
        spec = importlib.util.spec_from_file_location("source_poc", path)
        self.module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(self.module)

    def test_writer_preserves_finalist_status_and_genre(self):
        html = '<div class="end_article"><p>长篇小说</p><p>《测试书》</p><p>作者：甲</p><p>推荐语：一部关于城市生活的小说。</p></div>'
        books = self.module.parse_writer(
            html, "https://www.chinawriter.com.cn/example.html"
        )
        self.assertEqual(len(books), 1)
        self.assertEqual(books[0]["title"], "测试书")
        self.assertEqual(books[0]["source_type"], "长篇小说")
        self.assertEqual(books[0]["recommendation_status"], "文学好书入围书单")
        self.assertEqual(books[0]["intro_evidence"], "一部关于城市生活的小说。")

    def test_writer_rejects_image_only_or_missing_recommendation(self):
        html = '<div class="end_article"><p>长篇小说</p><p>《测试书》</p><p>作者：甲</p><p><img src="poster.jpg"></p></div>'
        self.assertEqual(
            self.module.parse_writer(
                html, "https://www.chinawriter.com.cn/example.html"
            ),
            [],
        )

    def test_writer_composite_genres_do_not_inherit_previous_genre(self):
        html = '<div class="end_article"><p>长篇小说</p><p>散文/随笔</p><p>《随笔集》</p><p>作者：甲</p><p>推荐语：关于生活的随笔。</p></div>'
        books = self.module.parse_writer(
            html, "https://www.chinawriter.com.cn/example.html"
        )
        self.assertEqual(books[0]["source_type"], "散文/随笔")

    def test_library_merges_inline_text_without_following_external_links(self):
        html = '<div class=TRS_Editor><p>题名：<span>心理知识</span></p><p>作者：<a href="https://outside.invalid/">乙</a></p><p>索书号：B84-49/1</p><p>内容简介：心理<span>学入门。</span></p><p>点这里查馆藏</p></div>'
        book = self.module.parse_library(
            html, "https://www.fjlib.net/zy/xstj/example.htm"
        )
        self.assertEqual(book["author"], "乙")
        self.assertEqual(book["intro_evidence"], "心理学入门。")
        self.assertEqual(book["types"], ["科普"])
        self.assertEqual(book["type_origin"], "本产品依据索书号映射，非机构官方类型")

    def test_library_missing_intro_fails_instead_of_fabricating(self):
        html = "<div class=TRS_Editor><p>题名：测试书</p><p>作者：乙</p><p>索书号：K1/1</p></div>"
        with self.assertRaises(ValueError):
            self.module.parse_library(html, "https://www.fjlib.net/zy/xstj/example.htm")

    def test_library_intro_outside_paragraphs_is_acquired(self):
        html = "<div class=TRS_Editor><p>题名：测试书</p><p>作者：乙</p><p>索书号：F1/1</p><div>内容简介：经济学入门。</div><p>点这里查馆藏</p></div>"
        book = self.module.parse_library(
            html, "https://www.fjlib.net/zy/xstj/example.htm"
        )
        self.assertEqual(book["intro_evidence"], "经济学入门。")

    def test_library_inline_metadata_preserves_colons_inside_title(self):
        html = "<div class=TRS_Editor><span>题名：人格：读懂自己</span><br><span>作者：乙</span><br><span>索书号：B84-49/1</span><br><span>内容简介：人格心理学。</span><a>点这里查馆藏</a></div>"
        book = self.module.parse_library(
            html, "https://www.fjlib.net/zy/xstj/example.htm"
        )
        self.assertEqual(book["title"], "人格：读懂自己")
        self.assertEqual(book["author"], "乙")
        self.assertEqual(book["intro_evidence"], "人格心理学。")

    def test_request_scope_rejects_other_hosts_and_protocols(self):
        for url in [
            "http://www.fjlib.net/",
            "https://127.0.0.1/",
            "https://www.fjlib.net.evil.invalid/",
            "file:///tmp/data",
        ]:
            with self.subTest(url=url), self.assertRaises(ValueError):
                self.module.validate_url(url)
        self.module.validate_url("https://www.fjlib.net/zy/xstj/example.htm")

    def test_unsupported_classification_is_explicit_not_guessed(self):
        self.assertEqual(self.module.library_type("Z999/1"), "未分类")
        self.assertEqual(self.module.library_type("K1/1"), "历史社科")


if __name__ == "__main__":
    unittest.main(verbosity=2)

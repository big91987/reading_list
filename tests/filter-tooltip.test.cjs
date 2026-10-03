const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { test } = require("node:test");

const appRoot = path.join(__dirname, "../app");
const source = fs.readFileSync(path.join(appRoot, "app.js"), "utf8");

function openPage() {
  const raw =
    '[ {"title":"活着","read":true,"edition":{"year":1993}}, {"title":"长安的荔枝","read":false,"custom":"保留"} ]';
  const writes = [];
  const elements = new Map();
  const documentListeners = new Map();
  function element() {
    const classes = new Set();
    const listeners = new Map();
    return {
      dataset: {},
      textContent: "",
      value: "",
      hidden: false,
      hovered: false,
      attributes: {},
      classList: {
        add: (name) => classes.add(name),
        remove: (name) => classes.delete(name),
        contains: (name) => classes.has(name),
        toggle(name, enabled) {
          if (enabled) classes.add(name);
          else classes.delete(name);
        },
      },
      addEventListener: (name, listener) => listeners.set(name, listener),
      dispatch: (name, event = {}) => listeners.get(name)?.(event),
      matches(selector) {
        assert.equal(selector, ":hover");
        return this.hovered;
      },
      setAttribute(name, value) {
        this.attributes[name] = value;
      },
      append() {},
      replaceChildren() {},
      querySelector: () => element(),
      focus() {},
      select() {},
    };
  }
  const filters = ["all", "unread", "read"].map((filter) => ({
    ...element(),
    dataset: { filter },
  }));
  const context = vm.createContext({
    document: {
      querySelector(selector) {
        if (!elements.has(selector)) elements.set(selector, element());
        return elements.get(selector);
      },
      querySelectorAll: () => filters,
      createElement: element,
      addEventListener: (name, listener) =>
        documentListeners.set(name, listener),
    },
    localStorage: {
      getItem(key) {
        assert.equal(key, "page-between-reading-list");
        return raw;
      },
      setItem: (...args) => writes.push(args),
    },
  });
  vm.runInContext(source, context);
  return {
    filters,
    writes,
    raw,
    key: (key) => documentListeners.get("keydown")({ key }),
    state: () =>
      JSON.parse(
        vm.runInContext(
          "JSON.stringify({books,currentFilter,visible:getVisibleBooks()})",
          context,
        ),
      ),
    run: (code) => vm.runInContext(code, context),
  };
}

test("Escape只抑制悬停入口，重复幂等，离开后复位，不消费键盘事件", () => {
  const page = openPage();
  const before = page.state();
  const hovered = page.filters[1];
  hovered.hovered = true;
  page.key("Escape");
  page.key("Escape");
  assert.equal(hovered.classList.contains("tooltip-dismissed"), true);
  assert.equal(page.filters[0].classList.contains("tooltip-dismissed"), false);
  assert.equal(page.filters[2].classList.contains("tooltip-dismissed"), false);
  hovered.hovered = false;
  hovered.dispatch("pointerleave");
  assert.equal(hovered.classList.contains("tooltip-dismissed"), false);
  hovered.hovered = true;
  page.key("Enter");
  page.key(" ");
  assert.equal(hovered.classList.contains("tooltip-dismissed"), false);
  assert.deepEqual(page.state(), before);
  assert.deepEqual(page.writes, []);
});

test("三种选中范围×三入口提示事件不改筛选、书籍、扩展字段或存储", () => {
  const page = openPage();
  for (const selected of page.filters) {
    selected.dispatch("click");
    const before = page.state();
    assert.equal(before.currentFilter, selected.dataset.filter);
    assert.equal(selected.attributes["aria-pressed"], "true");
    for (const target of page.filters) {
      target.hovered = true;
      page.key("Escape");
      target.hovered = false;
      target.dispatch("pointerleave");
      assert.deepEqual(page.state(), before);
    }
    const expected = JSON.parse(page.raw).filter(
      (book) =>
        selected.dataset.filter === "all" ||
        book.read === (selected.dataset.filter === "read"),
    );
    assert.deepEqual(before.visible, expected);
  }
  assert.deepEqual(page.state().books, JSON.parse(page.raw));
  assert.deepEqual(page.writes, []);
});

test("Escape不替换既有编辑取消且悬停抑制不重绘列表", () => {
  const page = openPage();
  page.run('editor = {book:books[0], draft:"草稿", error:""};');
  page.filters[0].hovered = true;
  page.key("Escape");
  assert.equal(page.run("editor.draft"), "草稿");
  assert.deepEqual(page.writes, []);
});

test("静态提示契约、布局增量及原点击业务逻辑保持（非浏览器可见性测试）", () => {
  const html = fs.readFileSync(path.join(appRoot, "index.html"), "utf8");
  const css = fs.readFileSync(path.join(appRoot, "styles.css"), "utf8");
  const labels = ["显示所有书籍", "只显示未读书籍", "只显示已读书籍"];
  const actualLabels = [
    ...html.matchAll(
      /<span class="filter-tooltip" aria-hidden="true"\s*>([\s\S]*?)<\/span\s*>/g,
    ),
  ].map((match) => match[1].trim());
  assert.deepEqual(actualLabels, labels);
  assert.equal((html.match(/class="filter-tooltip"/g) || []).length, 3);
  assert.match(css, /@media \(hover: hover\) and \(pointer: fine\)/);
  assert.match(
    css,
    /\.filter-button:hover:not\(\.tooltip-dismissed\) \.filter-tooltip/,
  );
  assert.match(
    css,
    /\.filter-tooltip \{\s*display: none;\s*position: absolute;\s*bottom: 100%;/,
  );
  assert.ok(!source.includes("prototype-94"));
});

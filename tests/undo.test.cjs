const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { test } = require("node:test");

const source = fs.readFileSync(path.join(__dirname, "../app/app.js"), "utf8");

function openPage(saved = []) {
  let stored = JSON.stringify(saved);
  let writes = 0;
  let failing = false;
  const elements = new Map();
  function element() {
    return {
      dataset: {},
      textContent: "",
      value: "",
      hidden: false,
      classList: { toggle() {} },
      addEventListener() {},
      setAttribute() {},
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
    },
    localStorage: {
      getItem: () => stored,
      setItem(_key, value) {
        if (failing) throw new Error("storage unavailable");
        stored = value;
        writes += 1;
      },
    },
  });
  vm.runInContext(source, context);
  return {
    run: (code) => vm.runInContext(code, context),
    state: (expression) =>
      JSON.parse(vm.runInContext(`JSON.stringify(${expression})`, context)),
    saved: () => JSON.parse(stored),
    writes: () => writes,
    fail: (enabled) => {
      failing = enabled;
    },
    elements,
  };
}

const baseline = [
  { title: "A", read: false, edition: { number: 2 } },
  { title: "B", read: true },
  { title: "C", read: false },
];

test("完整序位恢复，新增不会改变位置或丢失旧字段", () => {
  const page = openPage(baseline);
  page.run(
    'deleteBook(books[1]); persist([...books, { title: "D", read: false }]); undoLatestDelete();',
  );
  assert.deepEqual(page.saved(), [...baseline, { title: "D", read: false }]);
  assert.equal(page.state("undoRecord"), null);
  const writes = page.writes();
  page.run("undoLatestDelete();");
  assert.equal(page.writes(), writes);
});

test("仅最近一次成功删除可恢复，不复活已删邻居", () => {
  const page = openPage(baseline);
  page.run("deleteBook(books[2]); deleteBook(books[0]); undoLatestDelete();");
  assert.deepEqual(page.saved(), baseline.slice(0, 2));
});

test("原序位越界内部候选守卫追加末尾（非UI旅程）", () => {
  const page = openPage(baseline);
  page.run("deleteBook(books[2]); books = []; undoLatestDelete();");
  assert.deepEqual(page.saved(), [baseline[2]]);
});

test("缺失目标删除与无机会撤销不产生写入", () => {
  const page = openPage(baseline);
  page.run('deleteBook({ title: "A", read: false }); undoLatestDelete();');
  assert.equal(page.writes(), 0);
  assert.deepEqual(page.saved(), baseline);
});

test("隐藏及大小写冲突不写入，改名后重试保持原状态", () => {
  const page = openPage(baseline);
  page.run(
    'deleteBook(books[0]); persist([...books, { title: "a", read: true }]); currentFilter = "unread"; undoLatestDelete();',
  );
  assert.equal(page.writes(), 2);
  assert.equal(page.state("undoRecord.book.title"), "A");
  page.run(
    'persist(books.map(book => book.title === "a" ? {...book, title: "Other"} : book)); undoLatestDelete();',
  );
  assert.deepEqual(page.saved(), [...baseline, { title: "Other", read: true }]);
  assert.equal(page.state("currentFilter"), "unread");
});

test("失败删除保留之前机会和编辑对象引用", () => {
  const page = openPage(baseline);
  page.run(
    'deleteBook(books[0]); editor = {book: books[0], draft: "草稿", error: ""};',
  );
  const before = page.saved();
  page.fail(true);
  page.run("deleteBook(books[0]);");
  assert.deepEqual(page.saved(), before);
  assert.equal(page.run("editor.book === books[0]"), true);
  assert.equal(page.state("undoRecord.book.title"), "A");
  page.fail(false);
  page.run("deleteBook(books[0]);");
  assert.equal(page.state("undoRecord.book.title"), "B");
  assert.equal(page.state("editor"), null);
});

test("失败撤销不改内存/存储/筛选/草稿，重试只恢复一次", () => {
  const page = openPage(baseline);
  page.run(
    'deleteBook(books[0]); editor = {book: books[0], draft: "草稿", error: "错误"}; currentFilter = "read";',
  );
  const before = page.saved();
  page.fail(true);
  page.run("undoLatestDelete();");
  assert.deepEqual(page.state("books"), before);
  assert.deepEqual(page.saved(), before);
  assert.equal(page.state("undoRecord.book.title"), "A");
  page.fail(false);
  page.run("undoLatestDelete(); undoLatestDelete();");
  assert.deepEqual(page.saved(), baseline);
  assert.equal(page.run("editor.book === books[1]"), true);
  assert.equal(page.state("editor.draft"), "草稿");
  assert.equal(page.state("editor.error"), "错误");
  assert.equal(page.state("currentFilter"), "read");
  assert.equal(page.writes(), 2);
});

test("删除编辑中的书恢复最后保存版本与旧扩展字段", () => {
  const page = openPage(baseline);
  page.run(
    'editor = {book: books[0], draft: "未保存", error: ""}; deleteBook(books[0]); undoLatestDelete();',
  );
  assert.deepEqual(page.saved(), baseline);
  assert.equal(page.state("editor"), null);
});

test("旧JSON重复/长名/扩展字段沿用加载，刷新无撤销机会", () => {
  const legacy = [
    ...baseline,
    { title: "A", read: true },
    { title: "长".repeat(90), read: false, legacy: 1 },
  ];
  const page = openPage(legacy);
  assert.deepEqual(page.state("books"), legacy);
  page.run("deleteBook(books[0]);");
  const nextPage = openPage(page.saved());
  assert.deepEqual(nextPage.state("books"), legacy.slice(1));
  assert.equal(nextPage.state("undoRecord"), null);
  assert.equal(nextPage.writes(), 0);
});

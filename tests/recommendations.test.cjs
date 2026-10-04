const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { test } = require("node:test");
const { webcrypto } = require("node:crypto");

const product = fs.readFileSync(path.join(__dirname, "../app/app.js"), "utf8");
const deployed = fs.readFileSync(path.join(__dirname, "../docs/05-validation/tasks/100/compatibility/baseline/app.js"), "utf8");
const catalogue = JSON.parse(fs.readFileSync(path.join(__dirname, "../docs/05-validation/tasks/100/collector/catalogue.json"), "utf8"));

function openPage(raw, legacy = false) {
  let stored = raw;
  let writes = 0;
  let failing = false;
  function element() {
    return { dataset: {}, textContent: "", value: "", hidden: false, children: [], handlers: {},
      classList: { toggle() {}, remove() {} },
      addEventListener(name, handler) { this.handlers[name] = handler; }, setAttribute() {}, append(...children) { this.children.push(...children); }, replaceChildren() {},
      querySelector: element, querySelectorAll: () => [], focus() {}, select() {},
    };
  }
  const elements = new Map();
  const filters = ["all", "read", "unread"].map((filter) => ({ ...element(), dataset: { filter } }));
  const context = vm.createContext({
    document: {
      addEventListener() {}, createElement: element,
      querySelector(selector) {
        if (selector === "#recommend-records") return null;
        if (!elements.has(selector)) elements.set(selector, element());
        return elements.get(selector);
      },
      querySelectorAll: () => filters,
    },
    localStorage: {
      getItem: () => stored,
      setItem(_key, value) { if (failing) throw new Error("storage failed"); stored = value; writes += 1; },
    },
    window: { structuredClone, TextEncoder, URL }, crypto: webcrypto,
  });
  vm.runInContext(legacy ? deployed : product, context);
  return { run: (code) => vm.runInContext(code, context),
    state: (code) => JSON.parse(vm.runInContext(`JSON.stringify(${code})`, context)),
    raw: () => stored, saved: () => JSON.parse(stored), writes: () => writes,
    external: (value) => { stored = value; }, fail: (value) => { failing = value; },
  };
}

test("old raw JSON loads without rewriting and preserves unknown fields", () => {
  const raw = '[ { "title": "中文长书名", "read": true, "custom": {"nested":[1,2]} } ]';
  const page = openPage(raw);
  assert.equal(page.raw(), raw);
  assert.equal(page.writes(), 0);
  assert.deepEqual(page.state("books"), JSON.parse(raw));
});

test("foreign tag writes are not overwritten and local draft remains", () => {
  const page = openPage('[{"title":"A","read":false}]');
  page.run('editor = {book: books[0], draft: "草稿", error: ""}');
  const external = '[{"title":"A","read":true},{"title":"B","read":false}]';
  page.external(external);
  assert.equal(page.run('persist([...books,{title:"C",read:false}])'), false);
  assert.equal(page.raw(), external);
  assert.equal(page.state("editor.draft"), "草稿");
  assert.equal(page.state("books.length"), 1);
});

test("malformed originals are never replaced with empty successes", () => {
  for (const raw of ["{broken", '{"title":"A"}', '[{"title":"A","read":false},null]']) {
    const page = openPage(raw);
    assert.equal(page.run('persist([{title:"B",read:false}])'), false);
    assert.equal(page.raw(), raw);
  }
});

test("deep deletion snapshot and failed undo retain the entire metadata object", () => {
  const page = openPage('[{"title":"A","read":true,"unknown":{"a":[1]}}]');
  page.run('const original = books[0]; deleteBook(original); original.unknown.a.push(2)');
  page.fail(true);
  page.run("undoLatestDelete()");
  assert.deepEqual(page.state("undoRecord.book.unknown"), { a: [1] });
  assert.equal(page.saved().length, 0);
  page.fail(false);
  page.run("undoLatestDelete()");
  assert.deepEqual(page.saved(), [{ title: "A", read: true, unknown: { a: [1] } }]);
});

test("rename preserves a snapshot but marks only its origin association for review", () => {
  const page = openPage("[]");
  page.run(`const record = ${JSON.stringify(catalogue.records[0])}; const entry = {title: record.title, read: false, extra: 1, bookInfo: catalogueInformation(record)}; const replacement = {...entry, title: "新书名"}; markInformationForReview(replacement)`);
  assert.equal(page.state("replacement.bookInfo.catalogueLink.verification"), "needs_review");
  assert.equal(page.state("entry.bookInfo.catalogueLink.verification"), "verified");
  assert.equal(page.state("replacement.bookInfo.catalogueLink.titleAtAdoption"), catalogue.records[0].title);
  assert.equal(page.state("replacement.bookInfo.summary"), catalogue.records[0].summary);
});

test("catalogue snapshots and unsupported metadata namespaces are separated", () => {
  const page = openPage("[]");
  assert.equal(page.run('validInformation({legacy:true})'), false);
  page.run(`const snapshot = catalogueInformation(${JSON.stringify(catalogue.records[0])})`);
  assert.equal(page.run("validInformation(snapshot)"), true);
  assert.equal(page.run('allowedOrigin({sourceId:"writer",url:"javascript:alert(1)"})'), false);
  assert.equal(page.run('allowedOrigin({sourceId:"writer",url:"https://www.chinawriter.com.cn.evil.invalid/n1/a"})'), false);
});

test("schema and revision validation reject invalid public responses", async () => {
  const page = openPage("[]");
  assert.equal(await page.run(`verifiedCatalogue(${JSON.stringify(catalogue)}).then(() => true)`), true);
  const unsupported = { ...catalogue, schemaVersion: 2 };
  assert.equal(page.run(`validCatalogue(${JSON.stringify(unsupported)})`), false);
  const tampered = structuredClone(catalogue);
  tampered.records[0].summary = "not original";
  await assert.rejects(page.run(`verifiedCatalogue(${JSON.stringify(tampered)})`));
});

test("actual deployed 10c5e03 baseline preserves new metadata on read/delete/undo roundtrip", () => {
  const info = { schemaVersion: 1, types: ["科普"], summary: "我的人工简介", fieldOrigins: {types:"manual",summary:"manual"} };
  const raw = JSON.stringify([{ title: "书", read: true, bookInfo: info, unknown: { edition: 2 } }, {title:"邻居",read:false}]);
  const old = openPage(raw, true);
  assert.equal(old.raw(), raw);
  old.run('persist(books.map((entry,index) => index === 0 ? {...entry,read:false} : entry)); deleteBook(books[0]); undoLatestDelete()');
  assert.deepEqual(old.saved()[0].bookInfo, info);
  const newer = openPage(old.raw());
  assert.equal(newer.writes(), 0);
  newer.run('persist(books.map((entry,index) => index === 0 ? {...entry,bookInfo:{...entry.bookInfo,summary:"新版人工修改"}} : entry))');
  const rolledBack = openPage(newer.raw(), true);
  rolledBack.run('deleteBook(books[0]); undoLatestDelete()');
  assert.deepEqual(rolledBack.saved()[0], { title: "书", read: false, bookInfo: {...info,summary:"新版人工修改"}, unknown: {edition:2} });
});

test("actual old rename preserves full snapshot and new UI detects origin mismatch without a load write", () => {
  const page = openPage("[]");
  const info = page.state(`catalogueInformation(${JSON.stringify(catalogue.records[0])})`);
  const old = openPage(JSON.stringify([{title:catalogue.records[0].title,read:true,bookInfo:info,unknown:{keep:7}}]),true);
  old.run('editor={book:books[0],draft:books[0].title,error:""}; const oldEditor=createEditor(books[0],0); oldEditor.children[1].value="旧版修改后的书名"; oldEditor.handlers.submit({preventDefault(){}})');
  assert.equal(old.saved()[0].title,"旧版修改后的书名");
  assert.deepEqual(old.saved()[0].bookInfo,info);
  const newer=openPage(old.raw());
  assert.equal(newer.writes(),0);
  assert.equal(newer.raw(),old.raw());
  assert.deepEqual(newer.saved()[0].unknown,{keep:7});
  newer.run('const row=document.createElement("li"); appendBookInformation(row,books[0])');
  assert.equal(newer.run('row.children[0].children.some(node=>node.textContent === "来源关联待核对，改名后原信息保留。")'),true);
});

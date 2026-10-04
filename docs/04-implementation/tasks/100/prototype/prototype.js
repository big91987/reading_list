const STORAGE_KEY = "issue-100-prototype-books";
const TYPES = ["古典文学", "仙侠", "现当代文学", "历史社科", "科普", "其他"];
const seedBooks = [
  { title: "梅西传", read: false, sample: "旧格式单候选示例" },
  { title: "旧书示例", read: true, sample: "无匹配示例", extra: { preserved: true } },
  { title: "同名示例", read: false, sample: "歧义测试专用，不是真实官方荐书" },
];
let books = loadBooks();
let records = [];
let currentView = "recommendations";
let currentFilter = "all";
let editorIndex = null;
let suggestionsIndex = null;
let undoRecord = null;
let scenario = "loading";

function element(tag, text, className) {
  const node = document.createElement(tag);
  if (text !== undefined) node.textContent = text;
  if (className) node.className = className;
  return node;
}

function button(text, action, accessibleName = text) {
  const node = element("button", text);
  node.type = "button";
  node.setAttribute("aria-label", accessibleName);
  node.addEventListener("click", action);
  return node;
}

function normalise(title) {
  return title.trim().toLocaleLowerCase();
}

function loadBooks() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === null) return structuredClone(seedBooks);
    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed)) return structuredClone(seedBooks);
    return parsed.filter((book) => book && typeof book.title === "string" && typeof book.read === "boolean");
  } catch {
    return structuredClone(seedBooks);
  }
}

function persist(candidate) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(candidate));
    books = candidate;
    return true;
  } catch {
    return false;
  }
}

function message(text) {
  document.querySelector("#message").textContent = text;
}

function tags(types) {
  const group = element("div");
  for (const type of types?.length ? types : ["未分类"]) group.append(element("span", type, "tag"));
  return group;
}

function sourceNode(origin) {
  const group = element("div", undefined, "source");
  group.append(element("p", `${origin.organisation} · ${origin.recommendationStatus}`));
  group.append(element("p", `来源门类：${origin.sourceType} · 本产品分类另列`));
  group.append(element("p", `来源日期：${origin.publishedAt || "未知"} · 采集时间：${origin.collectedAt}`));
  try {
    const url = new URL(origin.url);
    if (url.protocol === "https:" && ["www.chinawriter.com.cn", "www.fjlib.net"].includes(url.hostname) && !url.username && !url.password && (!url.port || url.port === "443")) {
      const link = element("a", "查看推荐原页（新窗口）");
      link.href = url.href;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      group.append(link);
    } else group.append(element("p", "来源链接不可用", "warning"));
  } catch {
    group.append(element("p", "来源链接不可用", "warning"));
  }
  return group;
}

function showView(view) {
  currentView = view;
  document.querySelector("#recommendations").hidden = view !== "recommendations";
  document.querySelector("#books").hidden = view !== "books";
  document.querySelector("#recommend-tab").setAttribute("aria-pressed", String(view === "recommendations"));
  document.querySelector("#list-tab").setAttribute("aria-pressed", String(view === "books"));
  render();
}

function addRecommendation(record) {
  if (books.some((book) => normalise(book.title) === normalise(record.title))) {
    message(`《${record.title}》已在书单，原信息与阅读状态未改变。`);
    return;
  }
  const book = { title: record.title, read: false, bookInfo: { schemaVersion: 1, types: [...record.types], summary: record.summary, author: record.author, fieldOrigins: { summary: "catalogue", types: "catalogue" }, catalogueLink: { recordId: record.id, titleAtAdoption: record.title, verification: "verified", origins: structuredClone(record.origins) } } };
  if (!persist([...books, book])) {
    message(`未能加入《${record.title}》，书单未改变，请重试。`);
    return;
  }
  message(`已将《${record.title}》加入书单，默认未读。`);
  renderRecommendations();
}

function renderRecommendations() {
  const states = {
    ok: "目录可用 · 2个官方组织 · 6条原型推荐 · 2026-10-04采集",
    loading: "推荐加载中，仍可使用我的书单。",
    empty: "目录读取成功，当前没有可展示的推荐。",
    stale: "推荐已过期 · 仍显示最后成功目录，请维护者检查更新报告。",
    partial: "部分来源失败：中国作家网 · 福建省图书馆可用，失败来源保留缓存。",
    "failed-cache": "推荐更新失败 · 显示最后成功缓存，不影响我的书单。",
    "failed-none": "推荐暂不可用 · 没有可用缓存，请重试，仍可使用我的书单。",
  };
  document.querySelector("#catalogue-status").textContent = states[scenario];
  const filter = document.querySelector("#type-filter").value;
  const available = ["empty", "loading", "failed-none"].includes(scenario) ? [] : records;
  const visible = available.filter((record) => filter === "全部类型" || record.types.includes(filter));
  document.querySelector("#recommend-count").textContent = `显示 ${visible.length} 本 · 不自动加入`;
  const container = document.querySelector("#recommend-list");
  container.replaceChildren();
  for (const record of visible) {
    const card = element("article", undefined, "card");
    card.dataset.recordId = record.id;
    card.append(element("h3", record.title), element("p", record.author), tags(record.types), element("p", record.summary, "summary"));
    if (record.publisher) card.append(element("p", `出版社：${record.publisher}`, "help"));
    for (const origin of record.origins) card.append(sourceNode(origin));
    const exists = books.some((book) => normalise(book.title) === normalise(record.title));
    card.append(button(exists ? "已在书单" : "加入书单", () => addRecommendation(record), `加入《${record.title}》书单`));
    container.append(card);
  }
  const empty = document.querySelector("#recommend-empty");
  empty.hidden = visible.length > 0;
  empty.textContent = available.length && !visible.length ? `暂无${filter}推荐，可换个类型或手动添加；不代表没有这类书。` : states[scenario];
}

function createTypesSelect(id, selected, labelText, parent) {
  const label = element("label", labelText);
  label.htmlFor = id;
  const select = element("select");
  select.id = id;
  select.multiple = true;
  select.size = 3;
  for (const type of TYPES) {
    const option = element("option", type);
    option.selected = selected.includes(type);
    select.append(option);
  }
  parent.append(label, select);
  return select;
}

function createEditor(book, index) {
  const form = element("form");
  form.noValidate = true;
  const titleLabel = element("label", "书名");
  titleLabel.htmlFor = "edit-title";
  const title = element("input");
  title.id = "edit-title";
  title.maxLength = 80;
  title.value = book.title;
  form.append(titleLabel, title);
  const types = createTypesSelect("edit-types", book.bookInfo?.types || [], "类型（可多选）", form);
  const summaryLabel = element("label", "简介");
  summaryLabel.htmlFor = "edit-summary";
  const summary = element("textarea");
  summary.id = "edit-summary";
  summary.maxLength = 600;
  summary.rows = 5;
  summary.value = book.bookInfo?.summary || "";
  form.append(summaryLabel, summary, element("p", "只修改你的书单；目录更新不会覆盖人工信息。", "help"));
  const error = element("p");
  error.setAttribute("role", "alert");
  const actions = element("div", undefined, "actions");
  const save = element("button", "保存信息", "primary");
  save.type = "submit";
  actions.append(save, button("取消编辑", () => closeEditor(index)));
  form.append(actions, error);
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const newTitle = title.value.trim();
    const chosenTypes = [...types.selectedOptions].map((option) => option.value);
    if (!newTitle || chosenTypes.length > 3) { error.textContent = "书名不能为空，最多选择3个类型。"; return; }
    if (books.some((candidate, candidateIndex) => candidateIndex !== index && normalise(candidate.title) === normalise(newTitle))) { error.textContent = "书单中已有同名书籍，请调整书名。"; return; }
    const info = structuredClone(book.bookInfo || { schemaVersion: 1 });
    info.types = chosenTypes;
    info.summary = summary.value.trim();
    info.fieldOrigins = { ...info.fieldOrigins, types: "manual", summary: "manual" };
    if (newTitle !== book.title && info.catalogueLink) info.catalogueLink.verification = "needs_review";
    const replacement = { ...book, title: newTitle, bookInfo: info };
    if (!persist(books.map((candidate, candidateIndex) => candidateIndex === index ? replacement : candidate))) { error.textContent = "未能保存，原信息未改变，草稿仍保留，请重试。"; return; }
    editorIndex = null;
    suggestionsIndex = null;
    message("书籍信息已保存。");
    renderBooks();
    focusBook(index, "edit");
  });
  return form;
}

function closeEditor(index) {
  editorIndex = null;
  message("已取消，原信息未改变。");
  renderBooks();
  focusBook(index, "edit");
}

function focusBook(index, action) {
  document.querySelector(`[data-book-index="${index}"] [data-action="${action}"]`)?.focus();
}

function candidatesFor(book) {
  if (book.title === "同名示例") return [
    { id: "fixture-a", title: "同名示例", author: "示例作者甲", summary: "歧义夹具甲：仅用于确认流程，不是官方推荐。", types: ["其他"], origins: [] },
    { id: "fixture-b", title: "同名示例", author: "示例作者乙", summary: "歧义夹具乙：仅用于确认流程，不是官方推荐。", types: ["其他"], origins: [] },
  ];
  return records.filter((record) => normalise(record.title) === normalise(book.title));
}

function adoptCandidate(index, record) {
  const book = books[index];
  const info = structuredClone(book.bookInfo || { schemaVersion: 1 });
  const hasMissing = !info.summary || !info.types?.length || !info.author;
  if (!hasMissing && info.catalogueLink?.verification !== "needs_review") {
    message("没有可补的空缺，已有信息未改变。");
    return;
  }
  const origins = { ...info.fieldOrigins };
  if (!info.summary) { info.summary = record.summary; origins.summary = "catalogue"; }
  if (!info.types?.length) { info.types = [...record.types]; origins.types = "catalogue"; }
  if (!info.author) info.author = record.author;
  info.fieldOrigins = origins;
  info.catalogueLink = { recordId: record.id, titleAtAdoption: book.title, verification: "verified", origins: structuredClone(record.origins) };
  const replacement = { ...book, bookInfo: info };
  if (!persist(books.map((candidate, candidateIndex) => candidateIndex === index ? replacement : candidate))) { message("未能采用建议，原信息未改变，所选候选仍可重试。"); return; }
  suggestionsIndex = null;
  message("已采用空缺信息，已有内容保留。");
  renderBooks();
  focusBook(index, "suggest");
}

function suggestionPanel(book, index) {
  const panel = element("div", undefined, "panel");
  const candidates = candidatesFor(book);
  panel.append(element("p", candidates.length > 1 ? "找到多个同名候选，不会自动选择，请核对作者与出处。" : candidates.length ? "找到1个候选，确认后才补充空缺信息。" : "没有匹配候选，可手动编辑信息。"));
  panel.append(element("p", "保留已有信息，仅更新来源关联和空缺。", "help"));
  for (const record of candidates) {
    const candidate = element("div", undefined, "candidate");
    candidate.append(element("h4", `${record.title} · ${record.author}`), element("p", record.summary));
    candidate.append(element("p", `出版社：${record.publisher || "未知"} · 版次：${record.edition || "未知"}`, "help"));
    for (const origin of record.origins) candidate.append(sourceNode(origin));
    candidate.append(button("确认采用", () => adoptCandidate(index, record), `确认采用${record.author}的候选`));
    panel.append(candidate);
  }
  panel.append(button("关闭建议", () => { suggestionsIndex = null; renderBooks(); focusBook(index, "suggest"); }));
  return panel;
}

function deleteBook(index) {
  const snapshot = structuredClone(books[index]);
  if (!persist(books.filter((book, candidateIndex) => candidateIndex !== index))) { message("未能删除，书单未改变。"); return; }
  undoRecord = { book: snapshot, index };
  editorIndex = null;
  suggestionsIndex = null;
  renderBooks();
  document.querySelector("#undo").focus();
}

function renderBooks() {
  const container = document.querySelector("#book-list");
  container.replaceChildren();
  const visible = books.map((book, index) => ({ book, index })).filter(({ book }) => currentFilter === "all" || (currentFilter === "read" ? book.read : !book.read));
  document.querySelector("#book-count").textContent = `${books.length} 本书 · ${books.filter((book) => book.read).length} 本已读 · 当前显示 ${visible.length} 本`;
  for (const { book, index } of visible) {
    const card = element("article", undefined, "card");
    card.dataset.bookIndex = index;
    card.append(element("h3", book.title));
    if (book.sample) card.append(element("p", `原型示例：${book.sample}`, "help"));
    const label = element("label", undefined, "check-label");
    const checkbox = element("input");
    checkbox.type = "checkbox";
    checkbox.checked = book.read;
    checkbox.setAttribute("aria-label", `标记《${book.title}》为已读`);
    checkbox.addEventListener("change", () => {
      const replacement = { ...book, read: checkbox.checked };
      if (!persist(books.map((candidate, candidateIndex) => candidateIndex === index ? replacement : candidate))) { checkbox.checked = book.read; message("未能保存阅读状态，请重试。"); return; }
      renderBooks();
    });
    label.append(checkbox, document.createTextNode(book.read ? "已读" : "未读"));
    card.append(label);
    if (editorIndex === index) card.append(createEditor(book, index));
    else {
      card.append(tags(book.bookInfo?.types), element("p", book.bookInfo?.summary || "暂无简介", "summary"));
      if (book.bookInfo?.catalogueLink?.verification === "needs_review") card.append(element("p", "来源关联待核对：已改名，原信息保留，请核对候选。", "warning"));
      for (const origin of book.bookInfo?.catalogueLink?.origins || []) card.append(sourceNode(origin));
      const actions = element("div", undefined, "actions");
      const edit = button("编辑信息", () => { editorIndex = index; suggestionsIndex = null; renderBooks(); document.querySelector("#edit-title").focus(); }, `编辑《${book.title}》信息`);
      edit.dataset.action = "edit";
      const suggest = button("补全建议", () => { editorIndex = null; suggestionsIndex = index; renderBooks(); }, `查看《${book.title}》补全建议`);
      suggest.dataset.action = "suggest";
      actions.append(edit, suggest, button("删除", () => deleteBook(index), `删除《${book.title}》`));
      card.append(actions);
      if (suggestionsIndex === index) card.append(suggestionPanel(book, index));
    }
    container.append(card);
  }
  if (!visible.length) container.append(element("p", "当前没有书籍，可手动添加或从推荐加入。", "empty"));
  document.querySelector("#undo-panel").hidden = !undoRecord;
  document.querySelector("#undo-message").textContent = undoRecord ? `已删除《${undoRecord.book.title}》` : "";
}

function render() {
  renderRecommendations();
  renderBooks();
}

document.querySelector("#recommend-tab").addEventListener("click", () => showView("recommendations"));
document.querySelector("#list-tab").addEventListener("click", () => showView("books"));
document.querySelector("#type-filter").addEventListener("change", renderRecommendations);
document.querySelector("#scenario").addEventListener("change", (event) => { scenario = event.target.value; renderRecommendations(); });
document.querySelector("#retry").addEventListener("click", () => { scenario = "ok"; document.querySelector("#scenario").value = "ok"; message("原型已恢复目录展示；生产重试只重读目录，不触发采集。"); renderRecommendations(); });
for (const filterButton of document.querySelectorAll("[data-filter]")) filterButton.addEventListener("click", () => {
  currentFilter = filterButton.dataset.filter;
  editorIndex = null;
  suggestionsIndex = null;
  for (const entry of document.querySelectorAll("[data-filter]")) entry.setAttribute("aria-pressed", String(entry === filterButton));
  renderBooks();
});
document.querySelector("#undo").addEventListener("click", () => {
  if (!undoRecord) return;
  if (books.some((book) => normalise(book.title) === normalise(undoRecord.book.title))) { message("存在同名书籍，无法恢复。撤销机会仍保留。"); return; }
  const candidate = [...books];
  candidate.splice(Math.min(undoRecord.index, candidate.length), 0, structuredClone(undoRecord.book));
  if (!persist(candidate)) { message("未能恢复，撤销机会仍保留，请重试。"); return; }
  undoRecord = null;
  message("已恢复书籍及完整信息。");
  renderBooks();
});
document.querySelector("#add-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const title = document.querySelector("#new-title").value.trim();
  const types = [...document.querySelector("#new-types").selectedOptions].map((option) => option.value);
  const summary = document.querySelector("#new-summary").value.trim();
  const error = document.querySelector("#add-error");
  if (!title || types.length > 3) { error.textContent = "书名不能为空，最多选择3个类型。"; return; }
  if (books.some((book) => normalise(book.title) === normalise(title))) { error.textContent = "书单中已有同名书籍。"; return; }
  const book = { title, read: false, bookInfo: { schemaVersion: 1, types, summary, fieldOrigins: { types: "manual", summary: "manual" } } };
  if (!persist([...books, book])) { error.textContent = "未能保存新增书籍，草稿仍保留，请重试。"; return; }
  event.target.reset();
  error.textContent = "";
  message("书籍已添加。");
  renderBooks();
});
document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape" || currentView !== "books") return;
  if (editorIndex !== null) closeEditor(editorIndex);
  else if (suggestionsIndex !== null) { const index = suggestionsIndex; suggestionsIndex = null; renderBooks(); focusBook(index, "suggest"); }
});
render();
fetch("catalogue.json").then((response) => {
  if (!response.ok) throw new Error("Catalogue unavailable");
  return response.json();
}).then((data) => { records = data.records; scenario = "ok"; renderRecommendations(); }).catch(() => { scenario = "failed-none"; renderRecommendations(); });

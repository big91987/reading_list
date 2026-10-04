const RECOMMENDATION_KEY = "page-between-recommendations-v1";
const BOOK_TYPES = [
  "古典文学",
  "仙侠",
  "现当代文学",
  "历史社科",
  "科普",
  "其他",
];
const SOURCE_HOSTS = {
  writer: "www.chinawriter.com.cn",
  fjlib: "www.fjlib.net",
};
let catalogue = null;
let catalogueError = "";
let cacheError = "";
let catalogueLoading = false;
let informationEditor = null;
let suggestionBook = null;

function rebindInformation(previous, replacement) {
  if (informationEditor?.book === previous)
    informationEditor.book = replacement;
  if (suggestionBook === previous) suggestionBook = replacement;
}

function textNode(tag, text, className = "") {
  const node = document.createElement(tag);
  node.textContent = text;
  node.className = className;
  return node;
}

function actionButton(text, handler, label = text) {
  const button = textNode("button", text);
  button.type = "button";
  button.setAttribute("aria-label", label);
  button.addEventListener("click", handler);
  return button;
}

function normalTitle(title) {
  return title.trim().toLocaleLowerCase();
}

function limitedString(value, maximum, allowEmpty = true) {
  return (
    typeof value === "string" &&
    [...value].length <= maximum &&
    (allowEmpty || value.trim().length > 0)
  );
}

function allowedOrigin(origin) {
  if (!origin || !limitedString(origin.url, 2048, false)) return false;
  try {
    const url = new window.URL(origin.url);
    const prefix = origin.sourceId === "writer" ? "/n1/" : "/zy/xstj/";
    return (
      url.protocol === "https:" &&
      url.hostname === SOURCE_HOSTS[origin.sourceId] &&
      !url.port &&
      !url.username &&
      !url.password &&
      !url.search &&
      !url.hash &&
      url.pathname.startsWith(prefix)
    );
  } catch {
    return false;
  }
}

function validTypes(types) {
  return (
    Array.isArray(types) &&
    types.length <= 3 &&
    new Set(types).size === types.length &&
    types.every((kind) => BOOK_TYPES.includes(kind))
  );
}

function validInformation(info) {
  if (
    !info ||
    info.schemaVersion !== 1 ||
    !validTypes(info.types) ||
    !limitedString(info.summary, 600)
  )
    return false;
  if (
    !["author", "edition"].every(
      (field) =>
        info[field] === null ||
        info[field] === undefined ||
        limitedString(info[field], 120),
    )
  )
    return false;
  if (
    !info.fieldOrigins ||
    !Object.values(info.fieldOrigins).every((origin) =>
      ["manual", "catalogue"].includes(origin),
    )
  )
    return false;
  if (
    info.catalogueLink &&
    (!/^[a-f0-9]{64}$/.test(info.catalogueLink.recordId) ||
      !limitedString(info.catalogueLink.titleAtAdoption, 80, false) ||
      !Array.isArray(info.catalogueLink.origins) ||
      !info.catalogueLink.origins.every(allowedOrigin) ||
      !["verified", "needs_review"].includes(info.catalogueLink.verification))
  )
    return false;
  return true;
}

function validCatalogue(value) {
  const date = (input) =>
    typeof input === "string" &&
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,6})?Z$/.test(input) &&
    Number.isFinite(Date.parse(input));
  if (
    !value ||
    value.schemaVersion !== 1 ||
    !/^[a-f0-9]{64}$/.test(value.revision) ||
    !date(value.generatedAt) ||
    !["ok", "partial", "failed"].includes(value.status)
  )
    return false;
  if (
    !Array.isArray(value.records) ||
    value.records.length > 1000 ||
    !Array.isArray(value.sources) ||
    value.sources.length > 2
  )
    return false;
  if (new window.TextEncoder().encode(JSON.stringify(value)).length > 1048576)
    return false;
  if (
    new Set(value.records.map((record) => record.id)).size !==
    value.records.length
  )
    return false;
  const errors = [
    null,
    "network",
    "parse",
    "policy",
    "size_limit",
    "schema",
    "coverage_insufficient",
    "disabled",
  ];
  if (
    !value.sources.every(
      (source) =>
        Object.hasOwn(SOURCE_HOSTS, source.id) &&
        ["ok", "failed", "paused"].includes(source.status) &&
        errors.includes(source.errorCode) &&
        (source.lastSuccessAt === null || date(source.lastSuccessAt)) &&
        (source.lastAttemptAt === null || date(source.lastAttemptAt)),
    )
  )
    return false;
  return value.records.every(
    (record) =>
      /^[a-f0-9]{64}$/.test(record.id) &&
      limitedString(record.title, 80, false) &&
      limitedString(record.author, 120, false) &&
      limitedString(record.summary, 300, false) &&
      validTypes(record.types) &&
      record.types.length > 0 &&
      ["publisher", "edition"].every(
        (field) => record[field] === null || limitedString(record[field], 120),
      ) &&
      record.summaryOrigin?.method === "factual-template-v1" &&
      Array.isArray(record.origins) &&
      record.origins.length > 0 &&
      record.origins.every(
        (origin) =>
          allowedOrigin(origin) &&
          date(origin.collectedAt) &&
          (origin.publishedAt === null || date(origin.publishedAt)) &&
          limitedString(origin.organisation, 120, false) &&
          limitedString(origin.recommendationStatus, 120, false) &&
          limitedString(origin.sourceType, 120) &&
          limitedString(origin.typeOrigin, 120, false),
      ),
  );
}

function canonicalJSON(value) {
  if (Array.isArray(value)) return `[${value.map(canonicalJSON).join(",")}]`;
  if (value && typeof value === "object")
    return `{${Object.keys(value)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${canonicalJSON(value[key])}`)
      .join(",")}}`;
  return JSON.stringify(value);
}

async function verifiedCatalogue(value) {
  if (!validCatalogue(value)) throw new Error("invalid catalogue");
  const unsigned = { ...value };
  delete unsigned.revision;
  const hash = await crypto.subtle.digest(
    "SHA-256",
    new window.TextEncoder().encode(canonicalJSON(unsigned)),
  );
  const revision = [...new Uint8Array(hash)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
  if (revision !== value.revision) throw new Error("invalid revision");
  return value;
}

function sourceNode(origin) {
  const paragraph = textNode(
    "p",
    `${origin.organisation} · ${origin.recommendationStatus} · 原门类：${origin.sourceType} · ${origin.typeOrigin} · ${origin.publishedAt || "来源日期未知"} · 采集：${origin.collectedAt}`,
  );
  if (allowedOrigin(origin)) {
    const link = textNode("a", "查看来源原页");
    link.href = origin.url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    paragraph.append(" ", link);
  }
  return paragraph;
}

function catalogueInformation(record) {
  return {
    schemaVersion: 1,
    types: [...record.types],
    summary: record.summary,
    author: record.author,
    edition: record.edition,
    fieldOrigins: {
      types: "catalogue",
      summary: "catalogue",
      author: "catalogue",
      edition: "catalogue",
    },
    catalogueLink: {
      recordId: record.id,
      titleAtAdoption: record.title,
      verification: "verified",
      origins: window.structuredClone(record.origins),
    },
  };
}

function renderRecommendations() {
  const container = document.querySelector("#recommend-records");
  if (!container) return;
  const status = document.querySelector("#recommend-status");
  const states = [];
  if (catalogueLoading) states.push("正在加载推荐目录。");
  if (catalogueError)
    states.push(
      catalogue
        ? "推荐更新失败，显示上次缓存。"
        : "推荐加载失败；我的书单仍可使用，请重试。",
    );
  if (catalogue) {
    if (catalogue.coverage === "coverage_insufficient")
      states.push("当前来源覆盖不足：未达到两源三个非空类型。");
    if (catalogue.status === "partial")
      states.push("部分来源失败，保留最后成功内容。");
    if (catalogue.status === "failed")
      states.push("所有来源采集失败，显示最后成功内容。");
    if (
      catalogue.sources.some(
        (source) =>
          source.lastSuccessAt &&
          Date.now() - Date.parse(source.lastSuccessAt) > 7 * 86400000,
      )
    )
      states.push("目录已过期：来源超过七天未成功更新。");
    if (!catalogue.records.length) states.push("当前推荐目录为空。");
    if (!states.length) states.push("推荐目录已加载。");
    for (const source of catalogue.sources)
      states.push(
        `${source.organisation}：${source.status === "ok" ? "成功" : source.status === "paused" ? "已暂停" : "失败"}，最近成功：${source.lastSuccessAt || "无"}`,
      );
  }
  if (cacheError) states.push(cacheError);
  status.textContent = states.join(" ");
  const selected = document.querySelector("#recommend-type").value;
  const records = (catalogue?.records || []).filter(
    (record) => !selected || record.types.includes(selected),
  );
  const cards = records.map((record) => {
    const card = textNode("article", "", "recommend-card");
    card.append(
      textNode("h3", record.title),
      textNode(
        "p",
        `作者：${record.author} · 出版社：${record.publisher || "未知"} · 版次：${record.edition || "未知"}`,
      ),
      textNode("p", `${record.types.join(" / ")}（本产品类型）`),
      textNode("p", record.summary),
    );
    card.append(...record.origins.map(sourceNode));
    const exists = books.some(
      (book) => normalTitle(book.title) === normalTitle(record.title),
    );
    card.append(
      actionButton(
        exists ? "已在书单 · 再次加入" : "加入书单",
        () => {
          const message = document.querySelector("#recommend-message");
          if (
            books.some(
              (book) => normalTitle(book.title) === normalTitle(record.title),
            )
          ) {
            message.textContent = "这本书已在书单中，原状态和信息未改变。";
            return;
          }
          if (
            !persist([
              ...books,
              {
                title: record.title,
                read: false,
                bookInfo: catalogueInformation(record),
              },
            ])
          ) {
            message.textContent =
              "未能加入，书单未改变；若其他标签页有修改，请刷新后重试。";
            return;
          }
          message.textContent = `已将《${record.title}》加入书单。`;
          render();
        },
        `加入《${record.title}》到书单`,
      ),
    );
    return card;
  });
  if (catalogue && !records.length && selected)
    cards.push(textNode("p", "这个类型暂无推荐。"));
  container.replaceChildren(...cards);
}

async function refreshCatalogue() {
  if (catalogueLoading) return;
  catalogueLoading = true;
  renderRecommendations();
  const controller = new window.AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  try {
    const response = await window.fetch("/__recommendations/catalogue.json", {
      signal: controller.signal,
      credentials: "omit",
      cache: "no-store",
    });
    if (!response.ok) throw new Error("unavailable");
    const reader = response.body.getReader();
    const chunks = [];
    let size = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 1048576) {
        await reader.cancel();
        throw new Error("oversized");
      }
      chunks.push(value);
    }
    const bytes = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) {
      bytes.set(chunk, offset);
      offset += chunk.length;
    }
    const value = await verifiedCatalogue(
      JSON.parse(
        new window.TextDecoder("utf-8", { fatal: true }).decode(bytes),
      ),
    );
    catalogue = value;
    catalogueError = "";
    cacheError = "";
    try {
      localStorage.setItem(RECOMMENDATION_KEY, JSON.stringify(value));
    } catch {
      cacheError = "推荐缓存未保存，书单仍可使用。";
    }
  } catch {
    catalogueError = "unavailable";
  } finally {
    clearTimeout(timeout);
    catalogueLoading = false;
    renderRecommendations();
  }
}

function typeChoices(container, selected = []) {
  for (const kind of BOOK_TYPES) {
    const label = document.createElement("label");
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.value = kind;
    checkbox.checked = selected.includes(kind);
    label.append(checkbox, kind);
    container.append(label);
  }
}

function selectedTypes(container) {
  return [...container.querySelectorAll("input:checked")].map(
    (input) => input.value,
  );
}

function newBookInformation() {
  const types = selectedTypes(document.querySelector("#new-types"));
  const synopsis = document.querySelector("#new-summary").value.trim();
  if (!validTypes(types) || !limitedString(synopsis, 600)) {
    formMessage.textContent = "最多选择3个类型，简介最多600字，草稿仍保留。";
    return null;
  }
  return {
    schemaVersion: 1,
    types,
    summary: synopsis,
    fieldOrigins: { types: "manual", summary: "manual" },
  };
}

function markInformationForReview(book) {
  if (validInformation(book.bookInfo) && book.bookInfo.catalogueLink) {
    book.bookInfo = {
      ...book.bookInfo,
      catalogueLink: {
        ...book.bookInfo.catalogueLink,
        verification: "needs_review",
      },
    };
  }
  informationEditor = null;
  suggestionBook = null;
}

function closeInformation(book, action = "edit-info") {
  informationEditor = null;
  suggestionBook = null;
  render();
  const index = books.indexOf(book);
  list
    .querySelector(`[data-row-index="${index}"] [data-info-action="${action}"]`)
    ?.focus();
}

function informationForm(book) {
  const panel = textNode("form", "", "information-form");
  const draft = informationEditor.draft;
  let composing = false;
  panel.addEventListener("compositionstart", () => {
    composing = true;
  });
  panel.addEventListener("compositionend", () => {
    composing = false;
  });
  const fields = {};
  for (const [field, label, limit] of [
    ["summary", "简介", 600],
    ["author", "作者", 120],
    ["edition", "版次", 120],
  ]) {
    const wrapper = document.createElement("label");
    wrapper.textContent = `${label}（最多${limit}字）`;
    const input = document.createElement(
      field === "summary" ? "textarea" : "input",
    );
    input.value = draft[field] || "";
    input.addEventListener("input", () => {
      draft[field] = input.value;
    });
    wrapper.append(input);
    fields[field] = input;
    panel.append(wrapper);
  }
  const choices = textNode("fieldset", "");
  choices.append(textNode("legend", "类型（最多3个）"));
  typeChoices(choices, draft.types);
  choices.addEventListener("change", () => {
    draft.types = selectedTypes(choices);
  });
  const error = textNode("p", informationEditor.error, "edit-error");
  error.setAttribute("role", "alert");
  panel.append(choices, error);
  const save = textNode("button", "保存信息");
  save.type = "submit";
  panel.append(
    save,
    actionButton("取消编辑信息", () => closeInformation(book)),
  );
  panel.addEventListener("submit", (event) => {
    event.preventDefault();
    if (composing || !books.includes(book)) return;
    const saved = book.bookInfo || {
      schemaVersion: 1,
      types: [],
      summary: "",
      fieldOrigins: {},
    };
    const candidate = { ...saved, fieldOrigins: { ...saved.fieldOrigins } };
    for (const field of ["summary", "author", "edition", "types"]) {
      const value =
        field === "types" ? draft.types : (draft[field] || "").trim();
      candidate[field] = value;
      if (JSON.stringify(saved[field] ?? "") !== JSON.stringify(value))
        candidate.fieldOrigins[field] = "manual";
    }
    let message = "";
    if (!validInformation(candidate))
      message = "信息格式无效：最多3个类型、简介600字、作者和版次120字。";
    else if (
      !persist(
        books.map((entry) =>
          entry === book ? { ...book, bookInfo: candidate } : entry,
        ),
      )
    )
      message =
        "未能保存信息，原值未变、草稿仍保留；请重试或刷新处理其他标签页冲突。";
    if (message) {
      informationEditor.error = message;
      error.textContent = message;
      fields.summary.focus();
      return;
    }
    const replacement = books.find((entry) => entry.title === book.title);
    closeInformation(replacement);
    operationMessage.textContent = "书籍信息已保存。";
  });
  panel.addEventListener("keydown", (event) => {
    if (composing || event.isComposing || event.keyCode === 229) {
      if (event.key === "Enter") event.preventDefault();
      return;
    }
    if (event.key === "Escape" && !event.isComposing && event.keyCode !== 229) {
      event.preventDefault();
      closeInformation(book);
    }
  });
  return panel;
}

function suggestionPanel(book) {
  const panel = textNode("div", "", "suggestion-panel");
  const matches = (catalogue?.records || []).filter(
    (record) => normalTitle(record.title) === normalTitle(book.title),
  );
  panel.append(
    textNode(
      "p",
      matches.length
        ? `找到${matches.length}个候选，请核对作者、出版社和版次后确认；保留已有信息，仅更新来源关联和空缺。`
        : "没有匹配的补全建议，可手动编辑信息。",
    ),
  );
  for (const record of matches) {
    const card = textNode("article", "", "recommend-card");
    card.append(
      textNode("h4", `${record.title} · ${record.author}`),
      textNode(
        "p",
        `出版社：${record.publisher || "未知"} · 版次：${record.edition || "未知"}`,
      ),
      textNode("p", record.summary),
      ...record.origins.map(sourceNode),
    );
    card.append(
      actionButton(
        "确认采用",
        () => {
          if (!books.includes(book)) return;
          const candidate = window.structuredClone(
            book.bookInfo || {
              schemaVersion: 1,
              types: [],
              summary: "",
              fieldOrigins: {},
            },
          );
          const recommended = catalogueInformation(record);
          let changed = false;
          for (const field of ["types", "summary", "author", "edition"]) {
            if (
              !(Array.isArray(candidate[field])
                ? candidate[field].length
                : candidate[field]) &&
              (Array.isArray(recommended[field])
                ? recommended[field].length
                : recommended[field])
            ) {
              candidate[field] = recommended[field];
              candidate.fieldOrigins[field] = "catalogue";
              changed = true;
            }
          }
          if (
            !changed &&
            candidate.catalogueLink?.verification !== "needs_review" &&
            (!candidate.catalogueLink ||
              candidate.catalogueLink.titleAtAdoption === book.title)
          ) {
            operationMessage.textContent = "没有可补的空缺，书单未改变。";
            return;
          }
          candidate.catalogueLink = recommended.catalogueLink;
          if (
            !persist(
              books.map((entry) =>
                entry === book ? { ...book, bookInfo: candidate } : entry,
              ),
            )
          ) {
            operationMessage.textContent =
              "未能采用，原值和候选仍保留，请重试。";
            return;
          }
          closeInformation(
            books.find((entry) => entry.title === book.title),
            "suggest",
          );
          operationMessage.textContent = "已采用候选的空缺信息；已有内容保留。";
        },
        `确认采用《${record.title}》${record.author}的推荐信息`,
      ),
    );
    panel.append(card);
  }
  panel.append(
    actionButton("拒绝并关闭建议", () => closeInformation(book, "suggest")),
  );
  panel.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeInformation(book, "suggest");
  });
  return panel;
}

function appendBookInformation(item, book) {
  const details = textNode("div", "", "book-information");
  const info = validInformation(book.bookInfo) ? book.bookInfo : null;
  const conflicting = Object.hasOwn(book, "bookInfo") && !info;
  details.append(
    textNode("p", info?.types.length ? info.types.join(" / ") : "未分类"),
    textNode("p", info?.summary || "暂无简介"),
  );
  if (conflicting)
    details.append(
      textNode(
        "p",
        "已有bookInfo字段不兼容，不能覆盖；请导出备份后处理。",
        "edit-error",
      ),
    );
  if (
    info?.catalogueLink &&
    (info.catalogueLink.verification === "needs_review" ||
      info.catalogueLink.titleAtAdoption !== book.title)
  )
    details.append(textNode("p", "来源关联待核对，改名后原信息保留。"));
  if (info?.catalogueLink)
    details.append(...info.catalogueLink.origins.map(sourceNode));
  const edit = actionButton(
    "编辑信息",
    () => {
      if (conflicting) return;
      editor = null;
      suggestionBook = null;
      informationEditor = {
        book,
        draft: window.structuredClone(
          info || { types: [], summary: "", author: "", edition: "" },
        ),
        error: "",
      };
      render();
      list.querySelector(".information-form textarea")?.focus();
    },
    `编辑《${book.title}》信息`,
  );
  edit.dataset.infoAction = "edit-info";
  const suggest = actionButton(
    "补全建议",
    () => {
      if (conflicting) return;
      editor = null;
      informationEditor = null;
      suggestionBook = book;
      render();
      list.querySelector(".suggestion-panel button")?.focus();
    },
    `查看《${book.title}》补全建议`,
  );
  suggest.dataset.infoAction = "suggest";
  details.append(edit, suggest);
  if (informationEditor?.book === book) details.append(informationForm(book));
  if (suggestionBook === book) details.append(suggestionPanel(book));
  item.append(details);
}

function showBookView(recommendations) {
  document.querySelector("#recommend-panel").hidden = !recommendations;
  document.querySelector(".add-panel").hidden = recommendations;
  document.querySelector(".list-panel:not(#recommend-panel)").hidden =
    recommendations;
  document
    .querySelector("#recommend-tab")
    .setAttribute("aria-pressed", String(recommendations));
  document
    .querySelector("#list-tab")
    .setAttribute("aria-pressed", String(!recommendations));
}

document.addEventListener("DOMContentLoaded", async () => {
  typeChoices(document.querySelector("#new-types"));
  for (const kind of BOOK_TYPES) {
    const option = textNode("option", kind);
    option.value = kind;
    document.querySelector("#recommend-type").append(option);
  }
  document
    .querySelector("#recommend-type")
    .addEventListener("change", renderRecommendations);
  document
    .querySelector("#recommend-tab")
    .addEventListener("click", () => showBookView(true));
  document
    .querySelector("#list-tab")
    .addEventListener("click", () => showBookView(false));
  document
    .querySelector("#recommend-retry")
    .addEventListener("click", refreshCatalogue);
  try {
    const cached = JSON.parse(localStorage.getItem(RECOMMENDATION_KEY));
    if (cached) catalogue = await verifiedCatalogue(cached);
  } catch {
    catalogueError = "invalid cache";
  }
  renderRecommendations();
  refreshCatalogue();
});

const STORAGE_KEY = "page-between-reading-list";

const form = document.querySelector("#book-form");
const titleInput = document.querySelector("#book-title");
const formMessage = document.querySelector("#form-message");
const list = document.querySelector("#book-list");
const summary = document.querySelector("#reading-summary");
const operationMessage = document.querySelector("#operation-message");
const emptyState = document.querySelector("#empty-state");
const emptyTitle = document.querySelector("#empty-title");
const emptyDescription = document.querySelector("#empty-description");
const filterButtons = [...document.querySelectorAll("[data-filter]")];
const undoPanel = document.querySelector("#undo-panel");
const undoMessage = document.querySelector("#undo-message");
const undoButton = document.querySelector("#undo-button");
const undoErrorMessage = document.querySelector("#undo-error");

let storageSnapshot = null;
let storageValid = true;
let books = loadBooks();
let currentFilter = "all";
let editor = null;
let undoRecord = null;
let undoError = "";

function loadBooks() {
  try {
    storageSnapshot = localStorage.getItem(STORAGE_KEY);
    const saved = JSON.parse(storageSnapshot || "[]");
    if (!Array.isArray(saved)) {
      storageValid = false;
      return [];
    }
    storageValid = saved.every(
      (book) =>
        book &&
        typeof book.title === "string" &&
        typeof book.read === "boolean",
    );
    return saved.filter(
      (book) =>
        book &&
        typeof book.title === "string" &&
        typeof book.read === "boolean",
    );
  } catch {
    storageValid = false;
    return [];
  }
}

function persist(candidate) {
  try {
    if (
      !storageValid ||
      localStorage.getItem(STORAGE_KEY) !== storageSnapshot
    ) {
      operationMessage.textContent =
        "书单原值异常或已在其他标签页改变，请先备份并刷新后重试。";
      return false;
    }
    const serialized = JSON.stringify(candidate);
    localStorage.setItem(STORAGE_KEY, serialized);
    storageSnapshot = serialized;
    books = candidate;
    return true;
  } catch {
    return false;
  }
}

function getVisibleBooks() {
  if (currentFilter === "read") return books.filter((book) => book.read);
  if (currentFilter === "unread") return books.filter((book) => !book.read);
  return books;
}

function createBookItem(book) {
  const index = books.indexOf(book);
  const editing = editor?.book === book;
  const item = document.createElement("li");
  item.className = `book-item${book.read ? " is-read" : ""}${editing ? " is-editing" : ""}`;
  item.dataset.rowIndex = index;
  const checkLabel = document.createElement("label");
  checkLabel.className = "check-control";
  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = book.read;
  checkbox.setAttribute("aria-label", `标记《${book.title}》为已读`);
  checkbox.addEventListener("change", () => {
    operationMessage.textContent = "";
    const replacement = { ...book, read: checkbox.checked };
    if (
      !persist(books.map((entry) => (entry === book ? replacement : entry)))
    ) {
      checkbox.checked = book.read;
      operationMessage.textContent = "未能保存阅读状态，请重试。";
      return;
    }
    if (editor?.book === book) editor.book = replacement;
    if (typeof rebindInformation === "function")
      rebindInformation(book, replacement);
    if (editor && !getVisibleBooks().includes(editor.book)) editor = null;
    render();
    focusControl(replacement, "checkbox");
  });
  const checkmark = document.createElement("span");
  checkmark.className = "checkmark";
  checkmark.setAttribute("aria-hidden", "true");
  checkLabel.append(checkbox, checkmark);

  item.append(checkLabel);
  if (editing) {
    item.append(createEditor(book, index));
  } else {
    const title = document.createElement("span");
    title.className = "book-title";
    title.textContent = book.title;
    item.append(title);
  }
  const actions = document.createElement("div");
  actions.className = "book-actions";
  if (!editing) {
    const editButton = createButton(
      "修改书名",
      `修改《${book.title}》书名`,
      () => {
        editor = { book, draft: book.title, error: "" };
        operationMessage.textContent = "";
        render();
        const input = list.querySelector(".edit-input");
        input.focus();
        input.select();
      },
    );
    editButton.dataset.editIndex = index;
    actions.append(editButton);
  }
  const deleteButton = document.createElement("button");
  deleteButton.type = "button";
  deleteButton.className = "delete-button";
  deleteButton.textContent = "删除";
  deleteButton.setAttribute("aria-label", `删除《${book.title}》`);
  deleteButton.addEventListener("click", () => deleteBook(book));
  actions.append(deleteButton);
  item.append(actions);
  if (typeof appendBookInformation === "function" && !editing) {
    appendBookInformation(item, book);
  }
  return item;
}

function deleteBook(book) {
  const index = books.indexOf(book);
  if (index < 0) return;
  operationMessage.textContent = "";
  const snapshot = JSON.parse(JSON.stringify(book));
  if (!persist(books.filter((candidate) => candidate !== book))) {
    operationMessage.textContent = "未能删除，请重试。";
    return;
  }
  undoRecord = { book: snapshot, index };
  undoError = "";
  if (editor?.book === book) editor = null;
  render();
  undoButton.focus();
}

function undoLatestDelete() {
  if (!undoRecord) return;
  const { book, index } = undoRecord;
  operationMessage.textContent = "";
  if (
    books.some(
      (entry) =>
        entry.title.toLocaleLowerCase() === book.title.toLocaleLowerCase(),
    )
  ) {
    undoError = `无法恢复《${book.title}》：清单中已有同名书籍（可能在其他筛选中）。请先修改现存同名书的书名，再点撤销。`;
    renderUndo();
    return;
  }
  const candidate = [...books];
  candidate.splice(Math.min(index, candidate.length), 0, book);
  if (!persist(candidate)) {
    undoError = "未能保存恢复结果，书籍尚未恢复。撤销机会仍保留，请重试。";
    renderUndo();
    return;
  }
  undoRecord = null;
  undoError = "";
  render();
  focusControl(editor?.book || book, editor ? "editor" : "edit");
  operationMessage.textContent = `已恢复《${book.title}》。${getVisibleBooks().includes(book) ? "" : "当前筛选下不可见，可切换筛选查看。"}`;
}

function renderUndo() {
  undoPanel.hidden = !undoRecord;
  undoMessage.textContent = undoRecord
    ? `已删除《${undoRecord.book.title}》。`
    : "";
  if (undoRecord) {
    undoButton.setAttribute(
      "aria-label",
      `撤销删除《${undoRecord.book.title}》`,
    );
  }
  undoErrorMessage.textContent = undoError;
}

undoButton.addEventListener("click", undoLatestDelete);

function createButton(text, label, action) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "text-button";
  button.textContent = text;
  button.setAttribute("aria-label", label);
  button.addEventListener("click", action);
  return button;
}

function focusControl(book, kind) {
  const index = books.indexOf(book);
  const selector =
    kind === "checkbox"
      ? `input[type="checkbox"]`
      : kind === "editor"
        ? ".edit-input"
        : "[data-edit-index]";
  const control = list.querySelector(`[data-row-index="${index}"] ${selector}`);
  (
    control ||
    filterButtons.find((button) => button.dataset.filter === currentFilter)
  ).focus();
}

function validateTitle(rawTitle, target) {
  const title = rawTitle.trim();
  if (!title) return "请填写书名，不能只输入空格。";
  if (rawTitle.length > 80) return "书名不能超过 80 个长度单位，请缩短后保存。";
  if (
    books.some(
      (book) =>
        book !== target &&
        book.title.toLocaleLowerCase() === title.toLocaleLowerCase(),
    )
  ) {
    return "清单中已有同名书籍，请换一个书名。";
  }
  return "";
}

function createEditor(book, index) {
  const editForm = document.createElement("form");
  editForm.className = "edit-form";
  editForm.noValidate = true;
  const label = document.createElement("label");
  label.htmlFor = `edit-title-${index}`;
  label.textContent = "修改书名";
  const input = document.createElement("input");
  input.id = label.htmlFor;
  input.className = "edit-input";
  input.value = editor.draft;
  input.autocomplete = "off";
  input.setAttribute(
    "aria-describedby",
    `edit-help-${index} edit-error-${index}`,
  );
  input.setAttribute("aria-invalid", String(Boolean(editor.error)));
  let composing = false;
  input.addEventListener("compositionstart", () => {
    composing = true;
  });
  input.addEventListener("compositionend", () => {
    composing = false;
  });
  input.addEventListener("input", () => {
    editor.draft = input.value;
  });
  editForm.addEventListener("keydown", (event) => {
    if (event.isComposing || composing || event.keyCode === 229) {
      if (event.key === "Enter") event.preventDefault();
      return;
    }
    if (event.key === "Escape") {
      event.preventDefault();
      cancel();
    }
  });
  const help = document.createElement("p");
  help.id = `edit-help-${index}`;
  help.className = "edit-help";
  help.textContent = "最多 80 个长度单位 · 保存才会生效";
  const error = document.createElement("p");
  error.id = `edit-error-${index}`;
  error.className = "edit-error";
  error.setAttribute("role", "alert");
  error.textContent = editor.error;
  const controls = document.createElement("div");
  controls.className = "edit-controls";
  const save = document.createElement("button");
  save.type = "submit";
  save.className = "primary-button";
  save.textContent = "保存";
  function cancel() {
    editor = null;
    render();
    focusControl(book, "edit");
    operationMessage.textContent = "已取消修改。";
  }
  controls.append(save, createButton("取消", "取消", cancel));
  editForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (composing) return;
    operationMessage.textContent = "";
    if (!books.includes(book)) {
      editor = null;
      render();
      focusControl(null, "edit");
      operationMessage.textContent = "这本书已不存在。";
      return;
    }
    editor.draft = input.value;
    let message = validateTitle(input.value, book);
    const title = input.value.trim();
    const replacement = { ...book, title };
    if (
      title !== book.title &&
      typeof markInformationForReview === "function"
    ) {
      markInformationForReview(replacement);
    }
    if (
      !message &&
      !persist(books.map((entry) => (entry === book ? replacement : entry)))
    ) {
      message = "未能保存，原书名未改变。请重试或取消。";
    }
    if (message) {
      editor.error = message;
      error.textContent = message;
      input.setAttribute("aria-invalid", "true");
      input.focus();
      return;
    }
    editor = null;
    render();
    focusControl(replacement, "edit");
    operationMessage.textContent = `已将书名保存为《${title}》。`;
  });
  editForm.append(label, input, help, error, controls);
  return editForm;
}

function renderEmptyState(visibleBooks) {
  const isEmpty = visibleBooks.length === 0;
  emptyState.hidden = !isEmpty;
  if (!isEmpty) return;
  if (books.length === 0) {
    emptyTitle.textContent = "清单还是空的";
    emptyDescription.textContent = "从一本真正想读的书开始吧。";
  } else if (currentFilter === "read") {
    emptyTitle.textContent = "还没有读完的书";
    emptyDescription.textContent = "读完一本后，在这里为它打个勾。";
  } else {
    emptyTitle.textContent = "没有未读的书";
    emptyDescription.textContent = "清单里的书都读完了，真不错。";
  }
}

function render() {
  const visibleBooks = getVisibleBooks();
  const readCount = books.filter((book) => book.read).length;
  list.replaceChildren(...visibleBooks.map(createBookItem));
  summary.innerHTML = `共 ${books.length} 本 · 已读 <strong>${readCount}</strong> 本`;
  renderEmptyState(visibleBooks);
  renderUndo();
  if (typeof renderRecommendations === "function") renderRecommendations();
}

function updateFilterButtons() {
  filterButtons.forEach((button) => {
    const isActive = button.dataset.filter === currentFilter;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  operationMessage.textContent = "";
  const title = titleInput.value.trim();
  if (!title) {
    formMessage.textContent = "请先写下书名。";
    titleInput.focus();
    return;
  }
  if (
    books.some(
      (book) => book.title.toLocaleLowerCase() === title.toLocaleLowerCase(),
    )
  ) {
    formMessage.textContent = "这本书已经在清单里了。";
    titleInput.select();
    return;
  }
  const candidate = { title, read: false };
  if (typeof newBookInformation === "function") {
    const information = newBookInformation();
    if (!information) return;
    candidate.bookInfo = information;
  }
  if (!persist([...books, candidate])) {
    formMessage.textContent = "未能添加，请重试。";
    titleInput.focus();
    return;
  }
  editor = null;
  currentFilter = "all";
  updateFilterButtons();
  form.reset();
  formMessage.textContent = `已添加《${title}》。`;
  titleInput.focus();
  render();
});

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    editor = null;
    operationMessage.textContent = "";
    currentFilter = button.dataset.filter;
    updateFilterButtons();
    render();
  });
  button.addEventListener("pointerleave", () => {
    button.classList.remove("tooltip-dismissed");
  });
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  filterButtons.forEach((button) => {
    if (button.matches(":hover")) button.classList.add("tooltip-dismissed");
  });
});

render();

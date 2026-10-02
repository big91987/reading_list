const STORAGE_KEY = "page-between-reading-list-prototype-76";
const demoBooks = [
  { title: "长安的荔枝", read: false },
  { title: "也许你该找个人聊聊", read: false },
  { title: "Dune", read: true },
  { title: "当呼吸化为空气", read: true },
  { title: "悉达多", read: false },
  { title: "夜晚的潜水艇", read: false },
];
const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
let failWrites = false;
let initialRender = true;

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

let books = loadBooks();
let currentFilter = "all";
let editor = null;

function loadBooks() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const saved = stored === null ? demoBooks.map((book) => ({ ...book })) : JSON.parse(stored);
    if (!Array.isArray(saved)) return [];
    return saved.filter(
      (book) =>
        book &&
        typeof book.title === "string" &&
        typeof book.read === "boolean",
    );
  } catch {
    return [];
  }
}

function persist(candidate) {
  try {
    if (failWrites) throw new Error("Prototype write failure");
    localStorage.setItem(STORAGE_KEY, JSON.stringify(candidate));
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
  const art = document.createElement("div");
  art.className = "book-art";
  art.setAttribute("aria-hidden", "true");
  item.append(art);
  const checkLabel = document.createElement("label");
  checkLabel.className = "check-control";
  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = book.read;
  checkbox.setAttribute("aria-label", `标记《${book.title}》为${book.read ? "未读" : "已读"}`);
  checkbox.addEventListener("change", () => {
    formMessage.textContent = "";
    operationMessage.textContent = "";
    const replacement = { ...book, read: checkbox.checked };
    if (
      !persist(books.map((entry) => (entry === book ? replacement : entry)))
    ) {
      checkbox.checked = book.read;
      operationMessage.textContent = "未能保存阅读状态，请重试。";
      operationMessage.style.color = "var(--error)";
      return;
    }
    if (editor?.book === book) editor.book = replacement;
    if (editor && !getVisibleBooks().includes(editor.book)) editor = null;
    render();
    focusControl(replacement, "checkbox");
    operationMessage.style.color = "var(--accent)";
    operationMessage.textContent = `已将《${book.title}》标记为${replacement.read ? "已读" : "未读"}。`;
  });
  const checkmark = document.createElement("span");
  checkmark.className = "checkmark";
  checkmark.setAttribute("aria-hidden", "true");
  checkmark.textContent = book.read ? "已读完 · 可标记未读" : "未读 · 标记为已读";
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
        formMessage.textContent = "";
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
  deleteButton.addEventListener("click", () => {
    formMessage.textContent = "";
    operationMessage.textContent = "";
    const visibleIndex = getVisibleBooks().indexOf(book);
    if (!persist(books.filter((candidate) => candidate !== book))) {
      operationMessage.textContent = "未能删除，请重试。";
      operationMessage.style.color = "var(--error)";
      return;
    }
    if (editor?.book === book) editor = null;
    render();
    const visible = getVisibleBooks();
    const next = visible[Math.min(visibleIndex, visible.length - 1)];
    focusControl(next, editor?.book === next ? "editor" : "edit");
    operationMessage.textContent = `已删除《${book.title}》。`;
    operationMessage.style.color = "var(--accent)";
  });
  actions.append(deleteButton);
  item.append(actions);
  return item;
}

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
  input.setAttribute("aria-label", `修改《${book.title}》的书名`);
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

function render(transition = "none") {
  document.getAnimations().forEach((animation) => animation.cancel());
  const visibleBooks = getVisibleBooks();
  const readCount = books.filter((book) => book.read).length;
  list.replaceChildren(...visibleBooks.map(createBookItem));
  summary.innerHTML = `共 ${books.length} 本 · 已读 <strong>${readCount}</strong> 本`;
  document.querySelector("#total-count").textContent = books.length;
  document.querySelector("#read-count").textContent = readCount;
  document.querySelector("#ratio-fill").style.width = `${books.length ? readCount / books.length * 100 : 0}%`;
  document.querySelector("#visible-count").textContent = `显示 ${visibleBooks.length} 本`;
  renderEmptyState(visibleBooks);
  const emptyAction = document.querySelector("#empty-action");
  emptyAction.textContent = books.length ? "查看全部书籍" : "添加第一本书";
  if ((initialRender || transition !== "none") && !motionPreference.matches && !document.documentElement.classList.contains("reduced")) {
    const animatedItems = transition === "add" ? [...list.children].slice(-1) : [...list.children].slice(0, 12);
    animatedItems.forEach((item, index) => {
      item.style.setProperty("--delay", `${Math.min(index, 4) * 18}ms`);
      item.classList.add("appear");
    });
  }
  initialRender = false;
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
  formMessage.style.color = "var(--error)";
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
  if (!persist([...books, { title, read: false }])) {
    formMessage.textContent = "未能添加，请重试。";
    titleInput.focus();
    return;
  }
  editor = null;
  currentFilter = "all";
  updateFilterButtons();
  form.reset();
  formMessage.style.color = "var(--accent)";
  formMessage.textContent = `已添加《${title}》。`;
  titleInput.focus();
  render("add");
});

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    formMessage.textContent = "";
    editor = null;
    operationMessage.textContent = "";
    currentFilter = button.dataset.filter;
    updateFilterButtons();
    render("filter");
  });
});

render();

document.querySelector(".intro").classList.add("arrive");
document.querySelector("#book-title").addEventListener("input", () => {
  formMessage.style.color = "var(--error)";
  formMessage.textContent = "";
});
document.querySelector("#empty-action").addEventListener("click", () => {
  if (!books.length) return titleInput.focus();
  editor = null;
  currentFilter = "all";
  updateFilterButtons();
  render("filter");
  filterButtons[0].focus();
});
function setFixture(fixture) {
  failWrites = false;
  document.querySelector("#demo-failure").checked = false;
  if (!persist(fixture.map((book) => ({ ...book })))) {
    operationMessage.textContent = "原型数据初始化失败，请检查浏览器存储权限。";
    return;
  }
  editor = null;
  currentFilter = "all";
  form.reset();
  formMessage.textContent = "";
  operationMessage.textContent = "";
  updateFilterButtons();
  render("filter");
}
document.querySelector("#demo-reset").addEventListener("click", () => setFixture(demoBooks));
document.querySelector("#demo-empty").addEventListener("click", () => setFixture([]));
document.querySelector("#demo-single").addEventListener("click", () => setFixture([{ title: "一本用于检查历史长书名完整显示与换行的书：" + "在页间留一点时间，慢慢阅读。".repeat(9), read: false }]));
document.querySelector("#demo-hundred").addEventListener("click", () => setFixture(Array.from({ length: 100 }, (_, index) => ({ title: `阅读夹具 ${String(index + 1).padStart(3, "0")}`, read: index % 3 === 0 }))));
document.querySelector("#demo-failure").addEventListener("change", (event) => {
  failWrites = event.target.checked;
  operationMessage.textContent = failWrites ? "原型：本地写入失败模拟已开启。" : "原型：写入已恢复，可以重试。";
});
document.querySelector("#demo-reduced").addEventListener("change", (event) => {
  document.documentElement.classList.toggle("reduced", event.target.checked);
  document.getAnimations().forEach((animation) => animation.cancel());
});
motionPreference.addEventListener("change", () => {
  document.getAnimations().forEach((animation) => animation.cancel());
});
document.querySelector("#demo-inspect").addEventListener("click", () => {
  const overflow = document.documentElement.scrollWidth > document.documentElement.clientWidth;
  const motion = getComputedStyle(list.firstElementChild || document.querySelector(".intro")).animationName;
  document.querySelector("#demo-diagnostics").textContent = `${overflow ? "存在横向溢出" : "无页面级横向溢出"} · ${motion === "none" ? "非必要入场动画已关闭" : "入场动画样式已启用"} · ${window.innerWidth} CSS px`;
});
const motionCheck = document.createElement("button");
motionCheck.type = "button";
motionCheck.textContent = "检查动效与打断";
document.querySelector(".demo-controls").append(motionCheck);
motionCheck.addEventListener("click", () => {
  render("filter");
  const animations = [...list.children].flatMap((item) => item.getAnimations());
  const first = animations[0];
  if (!first) {
    document.querySelector("#demo-diagnostics").textContent = "没有非必要卡片动画：空清单或减少动态效果已生效。";
    return;
  }
  const timing = first.effect.getTiming();
  first.pause();
  first.currentTime = timing.delay + Number(timing.duration) / 2;
  const opacity = Number(getComputedStyle(list.firstElementChild).opacity);
  const intermediate = opacity > 0.6 && opacity < 1;
  render();
  const cancelled = animations.every((animation) => animation.playState === "idle");
  document.querySelector("#demo-diagnostics").textContent = `卡片入场 ${animations.length} 个 · 中间帧${intermediate ? "有插值" : "未确认插值"} · 打断${cancelled ? "已取消旧动画" : "未取消旧动画"}`;
});

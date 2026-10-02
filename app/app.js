const STORAGE_KEY = "page-between-reading-list";
const motionPreference = window.matchMedia?.(
  "(prefers-reduced-motion: reduce)",
);
let entranceAnimations = [];
let initialRender = true;
let addingComposition = false;

function cancelEntrances() {
  entranceAnimations.forEach((animation) => animation.cancel?.());
  entranceAnimations = [];
}

function animateEntrance(element, distance, duration, delay = 0) {
  if (motionPreference?.matches || typeof element.animate !== "function")
    return;
  try {
    entranceAnimations.push(
      element.animate(
        [
          {
            opacity: distance === 8 ? 0.5 : 0.6,
            transform: `translateY(${distance}px)`,
          },
          { opacity: 1, transform: "translateY(0)" },
        ],
        {
          duration,
          delay,
          easing: "cubic-bezier(.22,1,.36,1)",
          fill: "backwards",
        },
      ),
    );
  } catch {
    return;
  }
}

motionPreference?.addEventListener?.("change", cancelEntrances);

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

function announce(message, failed = false) {
  formMessage.textContent = "";
  operationMessage.setAttribute("role", failed ? "alert" : "status");
  operationMessage.setAttribute("aria-live", failed ? "assertive" : "polite");
  operationMessage.style.color = failed ? "var(--error)" : "var(--accent)";
  operationMessage.textContent = message;
}

function announceAdd(message, failed = false) {
  operationMessage.textContent = "";
  formMessage.setAttribute("role", failed ? "alert" : "status");
  formMessage.setAttribute("aria-live", failed ? "assertive" : "polite");
  formMessage.style.color = failed ? "var(--error)" : "var(--accent)";
  titleInput.setAttribute("aria-invalid", String(failed));
  formMessage.textContent = message;
}

function loadBooks() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
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
  checkbox.setAttribute(
    "aria-label",
    `标记《${book.title}》为${book.read ? "未读" : "已读"}`,
  );
  checkbox.addEventListener("change", () => {
    announce("");
    const replacement = { ...book, read: checkbox.checked };
    if (
      !persist(books.map((entry) => (entry === book ? replacement : entry)))
    ) {
      checkbox.checked = book.read;
      announce("未能保存阅读状态，请重试。", true);
      return;
    }
    if (editor?.book === book) editor.book = replacement;
    if (editor && !getVisibleBooks().includes(editor.book)) editor = null;
    render();
    focusControl(replacement, "checkbox");
    announce(
      `已将《${book.title}》标记为${replacement.read ? "已读" : "未读"}。`,
    );
  });
  const checkmark = document.createElement("span");
  checkmark.className = "checkmark";
  checkmark.setAttribute("aria-hidden", "true");
  checkmark.textContent = book.read
    ? "已读完 · 可标记未读"
    : "未读 · 标记为已读";
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
        if (!books.includes(book)) return;
        editor = { book, draft: book.title, error: "" };
        announce("");
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
    announce("");
    const visibleIndex = getVisibleBooks().indexOf(book);
    if (!persist(books.filter((candidate) => candidate !== book))) {
      announce("未能删除，请重试。", true);
      return;
    }
    if (editor?.book === book) editor = null;
    render();
    const visible = getVisibleBooks();
    const next = visible[Math.min(visibleIndex, visible.length - 1)];
    focusControl(next, editor?.book === next ? "editor" : "edit");
    announce(`已删除《${book.title}》。`);
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
  input.type = "text";
  input.id = label.htmlFor;
  input.className = "edit-input";
  input.setAttribute("aria-label", `修改《${book.title}》的书名`);
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
    announce("已取消修改。");
  }
  controls.append(save, createButton("取消", "取消", cancel));
  editForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (composing) return;
    announce("");
    if (!books.includes(book)) {
      editor = null;
      render();
      focusControl(null, "edit");
      announce("这本书已不存在。", true);
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
    announce(`已将书名保存为《${title}》。`);
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
  cancelEntrances();
  const visibleBooks = getVisibleBooks();
  const readCount = books.filter((book) => book.read).length;
  list.replaceChildren(...visibleBooks.map(createBookItem));
  summary.innerHTML = `共 ${books.length} 本 · 已读 <strong>${readCount}</strong> 本`;
  document.querySelector("#total-count").textContent = books.length;
  document.querySelector("#read-count").textContent = readCount;
  document.querySelector("#ratio-fill").style.width =
    `${books.length ? (readCount / books.length) * 100 : 0}%`;
  document.querySelector("#visible-count").textContent =
    `显示 ${visibleBooks.length} 本`;
  renderEmptyState(visibleBooks);
  document.querySelector("#empty-action").textContent = books.length
    ? "查看全部书籍"
    : "添加第一本书";
  if (initialRender || transition !== "none") {
    const items =
      transition === "add"
        ? [...list.children].slice(-1)
        : [...list.children].slice(0, 12);
    items.forEach((item, index) =>
      animateEntrance(item, 6, 220, Math.min(index, 4) * 18),
    );
    if (initialRender)
      animateEntrance(document.querySelector(".intro"), 8, 260);
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
  if (addingComposition) return;
  announceAdd("");
  const title = titleInput.value.trim();
  if (!title) {
    announceAdd("请先写下书名。", true);
    titleInput.focus();
    return;
  }
  if (titleInput.value.length > 80) {
    announceAdd("书名不能超过 80 个长度单位。", true);
    titleInput.focus();
    return;
  }
  if (
    books.some(
      (book) => book.title.toLocaleLowerCase() === title.toLocaleLowerCase(),
    )
  ) {
    announceAdd("这本书已经在清单里了。", true);
    titleInput.select();
    return;
  }
  if (!persist([...books, { title, read: false }])) {
    announceAdd("未能添加，请重试。", true);
    titleInput.focus();
    return;
  }
  editor = null;
  currentFilter = "all";
  updateFilterButtons();
  form.reset();
  announceAdd(`已添加《${title}》。`);
  titleInput.focus();
  render("add");
});

titleInput.addEventListener("compositionstart", () => {
  addingComposition = true;
});
titleInput.addEventListener("compositionend", () => {
  addingComposition = false;
});
titleInput.addEventListener("keydown", (event) => {
  if (
    event.key === "Enter" &&
    (event.isComposing || addingComposition || event.keyCode === 229)
  )
    event.preventDefault();
});
titleInput.addEventListener("input", () => {
  formMessage.textContent = "";
  titleInput.setAttribute("aria-invalid", "false");
});

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    editor = null;
    announce("");
    currentFilter = button.dataset.filter;
    updateFilterButtons();
    render("filter");
  });
});

document.querySelector("#empty-action").addEventListener("click", () => {
  if (!books.length) return titleInput.focus();
  editor = null;
  announce("");
  currentFilter = "all";
  updateFilterButtons();
  render("filter");
  filterButtons[0].focus();
});

render();

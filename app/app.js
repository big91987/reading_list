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

let books = loadBooks();
let currentFilter = "all";
let editor = null;
let undoRecord = null;
let undoError = "";

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
  return item;
}

function deleteBook(book) {
  const index = books.indexOf(book);
  if (index < 0) return;
  operationMessage.textContent = "";
  const snapshot = { ...book };
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
  if (!persist([...books, { title, read: false }])) {
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

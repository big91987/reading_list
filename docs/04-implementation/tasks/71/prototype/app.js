const STORAGE_KEY = "page-between-reading-list-prototype-71";
const form = document.querySelector("#book-form");
const titleInput = document.querySelector("#book-title");
const formMessage = document.querySelector("#form-message");
const list = document.querySelector("#book-list");
const summary = document.querySelector("#reading-summary");
const filters = [...document.querySelectorAll("[data-filter]")];
const operationMessage = document.querySelector("#operation-message");
const failWrite = document.querySelector("#fail-write");
let currentFilter = "all";
let editor = null;
let books = loadBooks();

function seedBooks() {
  return [{ title: "长安的荔枝", read: false }, { title: "Dune", read: true }, { title: "也许你该找个人聊聊", read: false }];
}

function loadBooks() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === null) {
      const initial = seedBooks();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed.filter(book => book && typeof book.title === "string" && typeof book.read === "boolean") : [];
  } catch {
    return [];
  }
}

function persist(candidate) {
  try {
    if (failWrite.checked) throw new Error("Simulated write failure");
    localStorage.setItem(STORAGE_KEY, JSON.stringify(candidate));
    books = candidate;
    return true;
  } catch {
    return false;
  }
}

function visibleBooks() {
  return books.filter(book => currentFilter === "all" || book.read === (currentFilter === "read"));
}

function button(text, label, action, className = "text-button") {
  const element = document.createElement("button");
  element.type = "button";
  element.className = className;
  element.textContent = text;
  element.setAttribute("aria-label", label);
  element.addEventListener("click", action);
  return element;
}

function focusEdit(book) {
  const index = books.indexOf(book);
  list.querySelector(`[data-edit-index="${index}"]`)?.focus();
}

function render() {
  const shown = visibleBooks();
  list.replaceChildren(...shown.map(createItem));
  summary.textContent = `共 ${books.length} 本 · 已读 ${books.filter(book => book.read).length} 本`;
  document.querySelector("#empty-state").hidden = shown.length !== 0;
  document.querySelector("#empty-title").textContent = books.length === 0 ? "清单还是空的" : currentFilter === "read" ? "还没有读完的书" : "没有未读的书";
  document.querySelector("#empty-description").textContent = books.length === 0 ? "从一本真正想读的书开始吧。" : currentFilter === "read" ? "读完一本后，在这里为它打个勾。" : "清单里的书都读完了，真不错。";
  filters.forEach(control => {
    const active = control.dataset.filter === currentFilter;
    control.classList.toggle("is-active", active);
    control.setAttribute("aria-pressed", String(active));
  });
}

function createItem(book) {
  const index = books.indexOf(book);
  const item = document.createElement("li");
  const editing = editor?.book === book;
  item.className = `book-item${book.read ? " is-read" : ""}${editing ? " is-editing" : ""}`;
  const checkLabel = document.createElement("label");
  checkLabel.className = "check-control";
  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = book.read;
  checkbox.setAttribute("aria-label", `标记《${book.title}》为已读`);
  checkbox.addEventListener("change", () => {
    const replacement = { ...book, read: checkbox.checked };
    const candidate = books.map(entry => entry === book ? replacement : entry);
    if (!persist(candidate)) {
      checkbox.checked = book.read;
      operationMessage.textContent = "未能保存阅读状态，请重试。";
      return;
    }
    if (editor?.book === book) editor.book = replacement;
    if (editor && !visibleBooks().includes(editor.book)) editor = null;
    render();
    list.querySelector(`[data-row-index="${index}"] input[type="checkbox"]`)?.focus();
    if (!list.contains(document.activeElement)) filters.find(control => control.dataset.filter === currentFilter).focus();
  });
  const checkmark = document.createElement("span");
  checkmark.className = "checkmark";
  checkmark.setAttribute("aria-hidden", "true");
  checkLabel.append(checkbox, checkmark);
  item.dataset.rowIndex = index;
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
    const editButton = button("修改书名", `修改《${book.title}》书名`, () => {
      editor = { book, draft: book.title, error: "" };
      operationMessage.textContent = "";
      render();
      const input = list.querySelector(".edit-input");
      input.focus();
      input.select();
    });
    editButton.dataset.editIndex = index;
    actions.append(editButton);
  }
  actions.append(button("删除", `删除《${book.title}》`, () => {
    const candidate = books.filter(entry => entry !== book);
    if (!persist(candidate)) {
      operationMessage.textContent = "未能删除，请重试。";
      return;
    }
    if (editor?.book === book) editor = null;
    operationMessage.textContent = `已删除《${book.title}》。`;
    render();
    const next = visibleBooks()[Math.min(index, visibleBooks().length - 1)];
    if (next && editor?.book !== next) focusEdit(next);
    else filters.find(control => control.dataset.filter === currentFilter).focus();
  }, "delete-button"));
  item.append(actions);
  return item;
}

function validation(raw, book) {
  const title = raw.trim();
  if (!title) return "请填写书名，不能只输入空格。";
  if (raw.length > 80) return "书名不能超过 80 个长度单位，请缩短后保存。";
  if (books.some(entry => entry !== book && entry.title.toLocaleLowerCase() === title.toLocaleLowerCase())) return "清单中已有同名书籍，请换一个书名。";
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
  input.setAttribute("aria-describedby", `edit-help-${index} edit-error-${index}`);
  input.setAttribute("aria-invalid", String(Boolean(editor.error)));
  let composing = false;
  input.addEventListener("compositionstart", () => { composing = true; });
  input.addEventListener("compositionend", () => { composing = false; });
  input.addEventListener("input", () => { editor.draft = input.value; });
  input.addEventListener("keydown", event => {
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
    focusEdit(book);
    operationMessage.textContent = "已取消修改。";
  }
  controls.append(save, button("取消", "取消", cancel));
  editForm.addEventListener("submit", event => {
    event.preventDefault();
    if (composing) return;
    const invalid = validation(input.value, book);
    const title = input.value.trim();
    const replacement = { ...book, title };
    const candidate = books.map(entry => entry === book ? replacement : entry);
    const message = invalid || (persist(candidate) ? "" : "未能保存，原书名未改变。请重试或取消。");
    if (message) {
      editor.error = message;
      error.textContent = message;
      input.setAttribute("aria-invalid", "true");
      input.focus();
      return;
    }
    editor = null;
    render();
    focusEdit(replacement);
    operationMessage.textContent = `已将书名保存为《${title}》。`;
  });
  editForm.append(label, input, help, error, controls);
  return editForm;
}

form.addEventListener("submit", event => {
  event.preventDefault();
  const error = validation(titleInput.value, null);
  if (error) {
    formMessage.textContent = error;
    titleInput.focus();
    return;
  }
  const title = titleInput.value.trim();
  if (!persist([...books, { title, read: false }])) {
    formMessage.textContent = "未能添加，请重试。";
    return;
  }
  editor = null;
  currentFilter = "all";
  form.reset();
  formMessage.textContent = `已添加《${title}》。`;
  render();
  titleInput.focus();
});

filters.forEach(control => control.addEventListener("click", () => {
  editor = null;
  currentFilter = control.dataset.filter;
  operationMessage.textContent = "";
  render();
}));

document.querySelector("#reset-demo").addEventListener("click", () => {
  failWrite.checked = false;
  if (!persist(seedBooks())) {
    operationMessage.textContent = "未能重置，请检查浏览器存储。";
    return;
  }
  editor = null;
  currentFilter = "all";
  render();
  operationMessage.textContent = "演示数据已重置。";
});

render();

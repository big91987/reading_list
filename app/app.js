const STORAGE_KEY = "page-between-reading-list";

const form = document.querySelector("#book-form");
const titleInput = document.querySelector("#book-title");
const formMessage = document.querySelector("#form-message");
const list = document.querySelector("#book-list");
const summary = document.querySelector("#reading-summary");
const emptyState = document.querySelector("#empty-state");
const emptyTitle = document.querySelector("#empty-title");
const emptyDescription = document.querySelector("#empty-description");
const filterButtons = [...document.querySelectorAll("[data-filter]")];

let books = loadBooks();
let currentFilter = "all";

function loadBooks() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    if (!Array.isArray(saved)) return [];
    return saved.filter((book) => book && typeof book.title === "string" && typeof book.read === "boolean");
  } catch {
    return [];
  }
}

function saveBooks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
}

function getVisibleBooks() {
  if (currentFilter === "read") return books.filter((book) => book.read);
  if (currentFilter === "unread") return books.filter((book) => !book.read);
  return books;
}

function createBookItem(book) {
  const item = document.createElement("li");
  item.className = `book-item${book.read ? " is-read" : ""}`;
  const checkLabel = document.createElement("label");
  checkLabel.className = "check-control";
  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = book.read;
  checkbox.setAttribute("aria-label", `标记《${book.title}》为已读`);
  checkbox.addEventListener("change", () => {
    book.read = checkbox.checked;
    saveBooks();
    render();
  });
  const checkmark = document.createElement("span");
  checkmark.className = "checkmark";
  checkmark.setAttribute("aria-hidden", "true");
  checkLabel.append(checkbox, checkmark);

  const title = document.createElement("span");
  title.className = "book-title";
  title.textContent = book.title;
  const deleteButton = document.createElement("button");
  deleteButton.type = "button";
  deleteButton.className = "delete-button";
  deleteButton.textContent = "删除";
  deleteButton.setAttribute("aria-label", `删除《${book.title}》`);
  deleteButton.addEventListener("click", () => {
    books = books.filter((candidate) => candidate !== book);
    saveBooks();
    render();
  });
  item.append(checkLabel, title, deleteButton);
  return item;
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
  const title = titleInput.value.trim();
  if (!title) {
    formMessage.textContent = "请先写下书名。";
    titleInput.focus();
    return;
  }
  if (books.some((book) => book.title.toLocaleLowerCase() === title.toLocaleLowerCase())) {
    formMessage.textContent = "这本书已经在清单里了。";
    titleInput.select();
    return;
  }
  books.push({ title, read: false });
  saveBooks();
  currentFilter = "all";
  updateFilterButtons();
  form.reset();
  formMessage.textContent = `已添加《${title}》。`;
  titleInput.focus();
  render();
});

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    currentFilter = button.dataset.filter;
    updateFilterButtons();
    render();
  });
});

render();

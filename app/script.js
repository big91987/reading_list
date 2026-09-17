(() => {
  const STORAGE_KEY = "reading-list.books.v1";
  const form = document.querySelector("#book-form");
  const titleInput = document.querySelector("#book-title");
  const message = document.querySelector("#form-message");
  const list = document.querySelector("#book-list");
  const template = document.querySelector("#book-template");
  const summary = document.querySelector("#summary");
  const emptyState = document.querySelector("#empty-state");
  const emptyTitle = document.querySelector("#empty-title");
  const emptyHint = document.querySelector("#empty-hint");
  const filterButtons = [...document.querySelectorAll("[data-filter]")];
  let books = loadBooks();
  let filter = "all";

  function loadBooks() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      return Array.isArray(saved) ? saved.filter((book) => book && typeof book.title === "string" && typeof book.read === "boolean") : [];
    } catch { return []; }
  }
  function saveBooks() { localStorage.setItem(STORAGE_KEY, JSON.stringify(books)); }
  function visibleBooks() {
    if (filter === "read") return books.filter((book) => book.read);
    if (filter === "unread") return books.filter((book) => !book.read);
    return books;
  }
  function render() {
    list.replaceChildren();
    const shown = visibleBooks();
    shown.forEach((book) => {
      const item = template.content.firstElementChild.cloneNode(true);
      const toggle = item.querySelector(".book-toggle");
      const deleteButton = item.querySelector(".delete-button");
      item.classList.toggle("is-read", book.read);
      item.querySelector(".book-title").textContent = book.title;
      item.querySelector(".book-status").textContent = book.read ? "已读完" : "等待阅读";
      toggle.checked = book.read;
      toggle.setAttribute("aria-label", `标记《${book.title}》为${book.read ? "未读" : "已读"}`);
      deleteButton.setAttribute("aria-label", `删除《${book.title}》`);
      toggle.addEventListener("change", () => { book.read = toggle.checked; saveBooks(); render(); });
      deleteButton.addEventListener("click", () => { books = books.filter((candidate) => candidate.id !== book.id); saveBooks(); render(); });
      list.append(item);
    });
    const readCount = books.filter((book) => book.read).length;
    summary.textContent = `共 ${books.length} 本 · 已读 ${readCount} 本`;
    emptyState.hidden = shown.length > 0;
    list.hidden = shown.length === 0;
    if (books.length === 0) {
      emptyTitle.textContent = "清单还是空的";
      emptyHint.textContent = "输入一本想读的书，开启阅读旅程。";
    } else {
      emptyTitle.textContent = filter === "read" ? "还没有读完的书" : "这个筛选下没有书";
      emptyHint.textContent = filter === "read" ? "读完一本后，在清单中为它打勾。" : "换一个筛选条件看看吧。";
    }
  }
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const title = titleInput.value.trim();
    if (!title) { message.textContent = "请先输入书名。"; titleInput.focus(); return; }
    if (books.some((book) => book.title.toLocaleLowerCase() === title.toLocaleLowerCase())) { message.textContent = "这本书已经在清单里了。"; titleInput.select(); return; }
    books.unshift({ id: `${Date.now()}-${Math.random().toString(16).slice(2)}`, title, read: false });
    saveBooks();
    filter = "all";
    updateFilterButtons();
    form.reset();
    message.textContent = `已加入《${title}》。`;
    render();
    titleInput.focus();
  });
  function updateFilterButtons() {
    filterButtons.forEach((button) => {
      const active = button.dataset.filter === filter;
      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", String(active));
    });
  }
  filterButtons.forEach((button) => button.addEventListener("click", () => {
    filter = button.dataset.filter;
    message.textContent = "";
    updateFilterButtons();
    render();
  }));
  render();
})();

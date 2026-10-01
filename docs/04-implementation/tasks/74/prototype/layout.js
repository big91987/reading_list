const preview = document.createElement("section");
preview.id = "layout-preview";
preview.className = "page-shell";
preview.hidden = true;
const previewHeading = document.createElement("h2");
previewHeading.textContent = "计数布局审查 · 仅展示三个状态的筛选区";
const scenarioPanels = document.createElement("div");
preview.append(previewHeading);
document.querySelector(".prototype-tools").before(preview);
document.querySelector("#demo-layout").addEventListener("click", () => {
  preview.hidden = !preview.hidden;
  if (preview.hidden) scenarioPanels.remove();
  else preview.append(scenarioPanels);
  document.querySelector("main").hidden = !preview.hidden;
  document.querySelector("footer").hidden = !preview.hidden;
});

const scenarios = [
  { name: "空书单", books: [] },
  { name: "样例书单", books: [{ read: true }, { read: false }, { read: false }] },
  { name: "四位数书单", books: Array.from({ length: 2468 }, (_, index) => ({ read: index < 1234 })) },
];

scenarios.forEach((scenario) => {
  const panel = document.createElement("section");
  panel.className = "list-panel";
  const heading = document.createElement("h2");
  heading.textContent = scenario.name;
  const filters = document.createElement("div");
  filters.className = "filters";
  filters.setAttribute("role", "group");
  filters.setAttribute("aria-label", scenario.name);
  const readCount = scenario.books.filter((book) => book.read).length;
  const counts = [scenario.books.length, scenario.books.length - readCount, readCount];
  ["全部", "未读", "已读"].forEach((name, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "filter-button" + (index === 0 ? " is-active" : "");
    button.setAttribute("aria-pressed", String(index === 0));
    button.append(name + " ");
    const count = document.createElement("span");
    count.className = "filter-count";
    count.textContent = counts[index];
    button.append(count);
    button.addEventListener("click", () => {
      [...filters.children].forEach((entry) => {
        entry.classList.toggle("is-active", entry === button);
        entry.setAttribute("aria-pressed", String(entry === button));
      });
    });
    filters.append(button);
  });
  panel.append(heading, filters);
  scenarioPanels.append(panel);
});

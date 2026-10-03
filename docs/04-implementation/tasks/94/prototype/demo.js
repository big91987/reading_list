const fixtures = {
  mixed: [{ title: "长安的荔枝", read: false }, { title: "活着", read: true }],
  empty: [],
  read: [{ title: "活着", read: true }],
  unread: [{ title: "长安的荔枝", read: false }],
};
document.querySelectorAll("[data-demo]").forEach((button) => {
  button.addEventListener("click", () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fixtures[button.dataset.demo]));
    location.reload();
  });
});
function reportDemo() {
  document.querySelector("#demo-filter").textContent = "当前筛选：" + document.querySelector('[data-filter][aria-pressed="true"]').dataset.filter;
  document.querySelector("#demo-layout").textContent = "横向溢出：" + (document.documentElement.scrollWidth > innerWidth ? "是" : "否");
}
new MutationObserver(reportDemo).observe(document.querySelector(".filters"), { attributes: true, subtree: true, attributeFilter: ["aria-pressed"] });
window.addEventListener("resize", reportDemo);
reportDemo();
document.querySelectorAll("[data-filter]").forEach((button) => {
  button.addEventListener("pointerenter", (event) => {
    const tooltip = button.querySelector(".filter-tooltip");
    const visible = getComputedStyle(tooltip).display !== "none" && tooltip.getBoundingClientRect().width > 0;
    const filter = document.querySelector('[data-filter][aria-pressed="true"]').dataset.filter;
    document.querySelector("#demo-hover").textContent = "真实指针进入：" + (event.isTrusted ? "是" : "否") + " · 提示可见：" + (visible ? "是" : "否") + " · 入口：" + button.dataset.filter + " · 点击前筛选：" + filter;
  });
});

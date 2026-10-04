const demoFixtures = [{ title: "长安的荔枝", read: false }, { title: "活着", read: true }];
document.querySelector("#demo-mixed").addEventListener("click", () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(demoFixtures));
  location.reload();
});
document.querySelector("#demo-clear").addEventListener("click", () => {
  localStorage.setItem(STORAGE_KEY, "[]");
  location.reload();
});
let demoScale = 1;
document.querySelector("#demo-zoom").addEventListener("click", () => {
  demoScale = 2;
  document.querySelector("main").style.zoom = "2";
  document.querySelector("footer").style.zoom = "2";
  reportDemo();
});
document.querySelector("#demo-reset").addEventListener("click", () => {
  demoScale = 1;
  document.querySelector("main").style.zoom = "1";
  document.querySelector("footer").style.zoom = "1";
  reportDemo();
});
function reportDemo() {
  const version = document.querySelector(".app-version");
  const bounds = version.getBoundingClientRect();
  const footer = document.querySelector("footer").getBoundingClientRect();
  const main = document.querySelector("main").getBoundingClientRect();
  const noOverflow = document.documentElement.scrollWidth <= innerWidth;
  const fits = bounds.left >= 0 && bounds.right <= innerWidth && version.scrollWidth <= version.clientWidth;
  const separated = footer.top >= main.bottom;
  const unique = document.querySelectorAll("#app-version").length === 1;
  const noFocus = !version.matches("a,button,input,[tabindex]") && !version.querySelector("a,button,input,[tabindex]");
  document.querySelector("#demo-report").textContent = "横向溢出：" + (noOverflow ? "否" : "是") + " · 版本完整：" + (fits ? "是" : "否") + " · 页脚不遮挡：" + (separated ? "是" : "否") + " · 版本唯一：" + (unique ? "是" : "否") + " · 版本无焦点：" + (noFocus ? "是" : "否") + " · CSS模拟倍率：" + demoScale;
}
window.addEventListener("resize", reportDemo);
new MutationObserver(reportDemo).observe(document.querySelector("main"), { childList: true, subtree: true });
reportDemo();

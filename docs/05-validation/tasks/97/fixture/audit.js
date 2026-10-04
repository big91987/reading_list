const storageKey = "page-between-reading-list";
const raw = '[ {"title":"活着","read":true,"edition":{"year":1993}}, {"title":"长安的荔枝","read":false,"custom":"保留"} ]';
const productFrame = document.querySelector("#product");
const report = document.querySelector("#report");
let expectedRaw = raw;
let scale = 1;

function reloadProduct() {
  scale = 1;
  report.textContent = "加载中";
  productFrame.src = `product/index.html?fixture=${Date.now()}`;
}

function measure() {
  const product = productFrame.contentDocument;
  const productWindow = productFrame.contentWindow;
  const version = product.querySelector(".app-version");
  const bounds = version.getBoundingClientRect();
  const footer = product.querySelector("footer").getBoundingClientRect();
  const main = product.querySelector("main").getBoundingClientRect();
  const fits = bounds.left >= 0 && bounds.right <= productWindow.innerWidth && version.scrollWidth <= version.clientWidth;
  const visible = productWindow.getComputedStyle(version).display !== "none" && bounds.height > 0;
  const unique = product.querySelectorAll("#app-version").length === 1 && version.textContent.trim() === "版本 0.1.0 rc2";
  const noFocus = !version.matches("a,button,input,[tabindex]") && !version.querySelector("a,button,input,[tabindex]");
  const rawUnchanged = localStorage.getItem(storageKey) === expectedRaw;
  const loaded = expectedRaw === raw
    ? product.querySelectorAll(".book-item").length === 2 && product.querySelector("#book-list").textContent.includes("活着") && product.querySelector("#book-list").textContent.includes("长安的荔枝")
    : !product.querySelector("#empty-state").hidden && product.querySelectorAll(".book-item").length === 0;
  report.textContent = `版本唯一可见：${unique && visible ? "是" : "否"} · 版本完整：${fits ? "是" : "否"} · 无横向溢出：${product.documentElement.scrollWidth <= productWindow.innerWidth ? "是" : "否"} · 页脚不遮挡：${footer.top >= main.bottom ? "是" : "否"} · 无版本焦点：${noFocus ? "是" : "否"} · 原始数据保持：${rawUnchanged ? "是" : "否"} · 加载结果正确：${loaded ? "是" : "否"} · CSS模拟倍率：${scale}`;
}

localStorage.setItem(storageKey, raw);
productFrame.addEventListener("load", measure);
document.querySelector("#measure").addEventListener("click", measure);
document.querySelector("#invalid").addEventListener("click", () => {
  expectedRaw = "not valid JSON";
  localStorage.setItem(storageKey, expectedRaw);
  reloadProduct();
});
document.querySelector("#restore").addEventListener("click", () => {
  expectedRaw = raw;
  localStorage.setItem(storageKey, expectedRaw);
  reloadProduct();
});
document.querySelector("#double").addEventListener("click", () => {
  scale = 2;
  productFrame.contentDocument.querySelector("main").style.zoom = "2";
  productFrame.contentDocument.querySelector("footer").style.zoom = "2";
  measure();
});
reloadProduct();

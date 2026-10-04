() => {
  const version = document.querySelector(".app-version");
  if (document.querySelectorAll("#app-version").length !== 1 || version.textContent.trim() !== "版本 0.1.0 rc2") throw Error("Incorrect or repeated version");
  version.scrollIntoView({ block: "center" });
  const range = document.createRange();
  range.selectNodeContents(version);
  const bounds = range.getBoundingClientRect();
  if (bounds.left < 0 || bounds.right > innerWidth || bounds.top < 0 || bounds.bottom > innerHeight) throw Error("Version cannot be fully read after scrolling");
  const center = document.elementFromPoint((bounds.left + bounds.right) / 2, (bounds.top + bounds.bottom) / 2);
  if (!center || !version.contains(center)) throw Error("Version is obscured");
  const resources = performance.getEntriesByType("resource").map((entry) => ({ name: new URL(entry.name).pathname, type: entry.initiatorType }));
  if (resources.some((entry) => ["fetch", "xmlhttprequest"].includes(entry.type))) throw Error("Unexpected runtime API request");
  return { text: version.textContent.trim(), viewport: { width: innerWidth, height: innerHeight }, bounds: { left: bounds.left, right: bounds.right, top: bounds.top, bottom: bounds.bottom }, resources, renderedBooks: document.querySelectorAll(".book-item").length };
}

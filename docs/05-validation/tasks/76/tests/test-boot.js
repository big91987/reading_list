window.testWrites = [];
window.testMotionEvents = [];
const mode =
  new URLSearchParams(location.search).get("mode") ||
  new URL(document.currentScript.src).searchParams.get("mode");
const originalSetItem = Storage.prototype.setItem;
if (mode === "fault") {
  originalSetItem.call(
    localStorage,
    "page-between-reading-list",
    JSON.stringify([
      { title: "长安的荔枝", read: false, legacy: { edition: 2 } },
      { title: "Dune", read: true },
    ]),
  );
}
Storage.prototype.setItem = function (key, value) {
  window.testWrites.push({ key, value });
  if (mode === "fault" && key === "page-between-reading-list")
    throw new DOMException(
      "Actual Storage boundary test",
      "QuotaExceededError",
    );
  return originalSetItem.call(this, key, value);
};
if (mode === "no-animation") {
  Element.prototype.animate = undefined;
  Document.prototype.getAnimations = undefined;
} else if (mode === "throw-animation") {
  Element.prototype.animate = () => {
    throw new Error("Unsupported animation");
  };
}
if (mode === "no-media") window.matchMedia = undefined;
if (mode === "controlled-media") {
  window.testPreference = {
    matches: false,
    addEventListener(type, callback) {
      window.testMotionEvents.push(callback);
    },
  };
  window.matchMedia = () => window.testPreference;
}

() => {
  const footer = document.querySelector("footer");
  const version = document.querySelector(".app-version");
  const main = document.querySelector("main");
  const footerBounds = footer.getBoundingClientRect();
  const versionBounds = version.getBoundingClientRect();
  const mainBounds = main.getBoundingClientRect();
  const productWidth = document.documentElement.scrollWidth;
  const beforeStorage = localStorage.getItem("page-between-reading-list");
  if (document.querySelectorAll("#app-version").length !== 1) {
    throw new Error("Version declaration is not unique");
  }
  if (footerBounds.left < 0 || footerBounds.right > innerWidth) {
    throw new Error("Footer exceeds the layout viewport");
  }
  if (footerBounds.top < mainBounds.bottom || versionBounds.top < mainBounds.bottom) {
    throw new Error("Version overlaps the reading list");
  }
  if (version.closest("[hidden],[aria-hidden='true']") || getComputedStyle(version).visibility !== "visible") {
    throw new Error("Version is hidden");
  }
  const originalChildren = [...footer.childNodes];
  const previousStyle = footer.getAttribute("style");
  let baselineWidth;
  try {
    footer.textContent = "一本一本，慢慢读完。";
    footer.style.maxWidth = "none";
    baselineWidth = document.documentElement.scrollWidth;
  } finally {
    footer.replaceChildren(...originalChildren);
    if (previousStyle === null) footer.removeAttribute("style");
    else footer.setAttribute("style", previousStyle);
  }
  if (productWidth > baselineWidth) {
    throw new Error("Version introduces additional horizontal overflow");
  }
  if (localStorage.getItem("page-between-reading-list") !== beforeStorage) {
    throw new Error("Layout validation changed reading-list data");
  }
  return {
    viewport: innerWidth,
    productWidth,
    baselineWidth,
    existingBodyMinWidth: getComputedStyle(document.body).minWidth,
    footerBounds: { left: footerBounds.left, right: footerBounds.right },
    nonOverlapping: true,
    storageUnchanged: true,
    baselineMethod: "Temporarily restore HEAD footer markup and remove the new max-width; retain unchanged body/main/business JS",
  };
}

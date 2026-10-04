() => {
  const footer = document.querySelector("footer");
  const version = document.querySelector(".app-version");
  const range = document.createRange();
  range.selectNodeContents(version);
  const measure = () => ({
    viewport: innerWidth,
    bodyMinWidth: getComputedStyle(document.body).minWidth,
    bodyWidth: document.body.getBoundingClientRect().width,
    footerWidth: footer.getBoundingClientRect().width,
    versionLeft: range.getBoundingClientRect().left,
    versionRight: range.getBoundingClientRect().right,
    documentWidth: document.documentElement.scrollWidth,
  });
  const before = measure();
  const previousStyle = footer.getAttribute("style");
  try {
    footer.style.maxWidth = "100vw";
    const candidate = measure();
    if (candidate.versionLeft < 0 || candidate.versionRight > innerWidth) {
      throw new Error("Viewport-bounded footer does not resolve version overflow");
    }
    return { before, candidate };
  } finally {
    if (previousStyle === null) footer.removeAttribute("style");
    else footer.setAttribute("style", previousStyle);
  }
}

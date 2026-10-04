() => {
  const visible = [...document.querySelectorAll("h1,h2,h3,p,button,input,textarea,select")].filter((node) => node.getClientRects().length);
  const overflow = visible.filter((node) => { const rectangle = node.getBoundingClientRect(); return rectangle.left < -1 || rectangle.right > innerWidth + 1; }).map((node) => node.textContent.slice(0, 60));
  if (document.documentElement.scrollWidth > innerWidth + 1 || overflow.length) throw new Error(`Horizontal overflow: ${JSON.stringify(overflow)}`);
  return { width: innerWidth, scrollWidth: document.documentElement.scrollWidth, devicePixelRatio, overflow };
}

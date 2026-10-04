() => {
  const page = document.documentElement;
  if (page.scrollWidth > window.innerWidth + 1) throw new Error(`Horizontal overflow: ${page.scrollWidth}/${window.innerWidth}`);
  const hiddenParents = (node) => node.closest('[hidden]') || node.getClientRects().length === 0;
  const controls = [...document.querySelectorAll('button, input, textarea, select, a')].filter((node) => !hiddenParents(node));
  for (const control of controls) {
    const bounds = control.getBoundingClientRect();
    if (bounds.left < -1 || bounds.right > window.innerWidth + 1) throw new Error(`Control outside viewport: ${control.textContent}`);
    if (control.tagName === 'BUTTON' && bounds.height < 43) throw new Error('Button touch target too short');
  }
  return { width: window.innerWidth, scrollWidth: page.scrollWidth, visibleControls: controls.length, noOverflow: true };
}

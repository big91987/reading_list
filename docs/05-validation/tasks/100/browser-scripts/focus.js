() => {
  const active = document.activeElement;
  if (active?.getAttribute('data-action') !== 'edit') throw new Error('Cancel did not restore edit focus');
  return { focus: active.getAttribute('aria-label') };
}
